import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { Webhook } from "svix";
import { db } from "./lib/db";
import { v4 as uuidv4 } from "uuid";
import { MemberRole } from "@prisma/client";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());

// Clerk Webhook needs raw body for verification
app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
    }

    // Get the headers
    const headerPayload = req.headers;
    const svix_id = headerPayload["svix-id"];
    const svix_timestamp = headerPayload["svix-timestamp"];
    const svix_signature = headerPayload["svix-signature"];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).send("Error occured -- no svix headers");
    }

    // Get the body
    const payload = req.body;
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id as string,
        "svix-timestamp": svix_timestamp as string,
        "svix-signature": svix_signature as string,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return res.status(400).send("Error occured");
    }

    // Handle the event
    const eventType = evt.type;

    if (eventType === "user.created") {
      await db.user.create({
        data: {
          userId: evt.data.id,
          name: `${evt.data.first_name} ${evt.data.last_name}`,
          imageUrl: evt.data.image_url,
          email: evt.data.email_addresses[0].email_address,
        },
      });
    }

    if (eventType === "user.updated") {
      await db.user.update({
        where: { userId: evt.data.id },
        data: {
          name: `${evt.data.first_name} ${evt.data.last_name}`,
          imageUrl: evt.data.image_url,
          email: evt.data.email_addresses[0].email_address,
        },
      });
    }

    return res.status(200).json({ success: true });
  }
);

app.use(express.json());

app.post("/api/auth/sync", async (req, res) => {
  const { userId, name, imageUrl, email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await db.user.upsert({
      where: { userId },
      update: {
        name,
        imageUrl,
        email,
      },
      create: {
        userId,
        name,
        imageUrl,
        email,
      },
    });
    return res.json(user);
  } catch (error) {
    console.error("Error syncing user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/servers", async (req, res) => {
  try {
    const { name, imageUrl, userId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await db.user.findUnique({
      where: {
        userId: userId,
      }
    });

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuidv4(),
        channels: {
          create: [
            { name: "general", profileId: profile.id }
          ]
        },
        members: {
          create: [
            { profileId: profile.id, role: MemberRole.ADMIN }
          ]
        }
      }
    });

    return res.json(server);
  } catch (error) {
    console.log("[SERVERS_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
});

app.get("/api/servers", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await db.user.findUnique({
      where: {
        userId: userId,
      }
    });

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    const servers = await db.server.findMany({
      where: {
        members: {
          some: {
            profileId: profile.id
          }
        }
      }
    });

    return res.json(servers);
  } catch (error) {
    console.log("[SERVERS_GET]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
});

app.get("/api/servers/:serverId", async (req, res) => {
  try {
    const { userId } = req.query;
    const { serverId } = req.params;

    if (!userId || typeof userId !== "string") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await db.user.findUnique({
      where: {
        userId: userId,
      }
    });

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    const server = await db.server.findUnique({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id
          }
        }
      },
      include: {
        channels: {
          orderBy: {
            createdAt: "asc"
          }
        },
        members: {
          include: {
            profile: true
          },
          orderBy: {
            role: "asc"
          }
        }
      }
    });

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    return res.json(server);
  } catch (error) {
    console.log("[SERVER_ID_GET]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
});

// Invite Code Endpoint - Join Server
app.post("/api/servers/join/:inviteCode", async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await db.user.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    const server = await db.server.findUnique({
      where: { inviteCode }
    });

    if (!server) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    // Check if user is already a member
    const existingMember = await db.member.findFirst({
      where: {
        serverId: server.id,
        profileId: profile.id
      }
    });

    if (existingMember) {
      return res.status(400).json({ message: "Already a member of this server" });
    }

    // Add user as a member
    const member = await db.member.create({
      data: {
        serverId: server.id,
        profileId: profile.id,
        role: MemberRole.GUEST
      }
    });

    return res.json({ success: true, server });
  } catch (error) {
    console.log("[JOIN_SERVER]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
});

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log(`[Socket.IO] User connected: ${socket.id}`);

  // Join a channel room
  socket.on("join-channel", (data: { channelId: string; userId: string }) => {
    const { channelId, userId } = data;
    const roomName = `channel-${channelId}`;
    socket.join(roomName);
    console.log(`[Socket.IO] User ${userId} joined channel ${channelId}`);
    
    // Notify others that a user joined
    socket.to(roomName).emit("user-joined", { userId });
  });

  // Leave a channel room
  socket.on("leave-channel", (data: { channelId: string; userId: string }) => {
    const { channelId, userId } = data;
    const roomName = `channel-${channelId}`;
    socket.leave(roomName);
    console.log(`[Socket.IO] User ${userId} left channel ${channelId}`);
    
    // Notify others that a user left
    socket.to(roomName).emit("user-left", { userId });
  });

  // Send a message to a channel
  socket.on("send-message", async (data: { channelId: string; memberId: string; content: string; fileUrl?: string }) => {
    try {
      const { channelId, memberId, content, fileUrl } = data;
      
      // Save message to database
      const message = await db.message.create({
        data: {
          content,
          fileUrl: fileUrl || null,
          channelId,
          memberId
        },
        include: {
          member: {
            include: {
              profile: true
            }
          }
        }
      });

      const roomName = `channel-${channelId}`;
      io.to(roomName).emit("new-message", message);
      console.log(`[Socket.IO] Message sent to channel ${channelId}`);
    } catch (error) {
      console.error("[Socket.IO] Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Edit a message
  socket.on("edit-message", async (data: { messageId: string; content: string; channelId: string }) => {
    try {
      const { messageId, content, channelId } = data;
      
      const message = await db.message.update({
        where: { id: messageId },
        data: { content },
        include: {
          member: {
            include: {
              profile: true
            }
          }
        }
      });

      const roomName = `channel-${channelId}`;
      io.to(roomName).emit("message-updated", message);
      console.log(`[Socket.IO] Message ${messageId} updated`);
    } catch (error) {
      console.error("[Socket.IO] Error editing message:", error);
      socket.emit("error", { message: "Failed to edit message" });
    }
  });

  // Delete a message
  socket.on("delete-message", async (data: { messageId: string; channelId: string }) => {
    try {
      const { messageId, channelId } = data;
      
      await db.message.update({
        where: { id: messageId },
        data: { deleted: true }
      });

      const roomName = `channel-${channelId}`;
      io.to(roomName).emit("message-deleted", { messageId });
      console.log(`[Socket.IO] Message ${messageId} deleted`);
    } catch (error) {
      console.error("[Socket.IO] Error deleting message:", error);
      socket.emit("error", { message: "Failed to delete message" });
    }
  });

  // Get channel messages (on demand)
  socket.on("get-messages", async (data: { channelId: string }, callback) => {
    try {
      const { channelId } = data;
      
      const messages = await db.message.findMany({
        where: {
          channelId,
          deleted: false
        },
        include: {
          member: {
            include: {
              profile: true
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      });

      callback({ success: true, messages });
    } catch (error) {
      console.error("[Socket.IO] Error fetching messages:", error);
      callback({ success: false, error: "Failed to fetch messages" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
