import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

import { ServerSidebar } from "@/components/server/server-sidebar";
import { useServerStore } from "@/hooks/use-server-store";
import { useSocket } from "@/components/providers/socket-provider";
import { useMessageStore } from "@/hooks/use-message-store";
import type { Message } from "@/hooks/use-message-store";

export const ServerIdPage = () => {
  const { serverId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const { currentServer, setCurrentServer } = useServerStore();
  const { socket, isConnected } = useSocket();
  const { messages, setMessages, addMessage } = useMessageStore();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  // Fetch server data
  useEffect(() => {
    if (!user || !serverId) return;

    const fetchServer = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/servers/${serverId}`, {
          params: { userId: user.id }
        });
        setCurrentServer(response.data);
        
        // Set the first channel as selected
        if (response.data.channels.length > 0) {
          setSelectedChannelId(response.data.channels[0].id);
        }
      } catch (error) {
        console.log("Failed to fetch server", error);
        navigate("/");
      }
    }

    fetchServer();
  }, [user, serverId, navigate, setCurrentServer]);

  // Join channel and fetch messages
  useEffect(() => {
    if (!socket || !isConnected || !selectedChannelId || !user) return;

    // Join the channel room
    socket.emit("join-channel", { channelId: selectedChannelId, userId: user.id });

    // Fetch existing messages
    socket.emit("get-messages", { channelId: selectedChannelId }, (response: any) => {
      if (response.success) {
        setMessages(selectedChannelId, response.messages);
      }
    });

    // Listen for new messages
    socket.on("new-message", (message: Message) => {
      if (message.channelId === selectedChannelId) {
        addMessage(selectedChannelId, message);
      }
    });

    // Listen for message updates
    socket.on("message-updated", (message: Message) => {
      if (message.channelId === selectedChannelId) {
        const { updateMessage } = useMessageStore.getState();
        updateMessage(selectedChannelId, message.id, message);
      }
    });

    // Listen for message deletions
    socket.on("message-deleted", (data: { messageId: string }) => {
      const { deleteMessage } = useMessageStore.getState();
      deleteMessage(selectedChannelId, data.messageId);
    });

    return () => {
      socket.emit("leave-channel", { channelId: selectedChannelId, userId: user.id });
      socket.off("new-message");
      socket.off("message-updated");
      socket.off("message-deleted");
    };
  }, [socket, isConnected, selectedChannelId, user, setMessages, addMessage]);

  // Send message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !socket || !selectedChannelId || !currentServer) return;

    const member = currentServer.members.find((m) => m.profile.id === user?.id);
    if (!member) return;

    socket.emit("send-message", {
      channelId: selectedChannelId,
      memberId: member.id,
      content: messageInput
    });

    setMessageInput("");
  };

  if (!currentServer) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const channelMessages = messages[selectedChannelId] || [];

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar 
          server={currentServer} 
          selectedChannelId={selectedChannelId}
          onSelectChannel={setSelectedChannelId}
        />
      </div>
      <main className="flex-1 md:pl-60 p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{currentServer.name}</h1>
          {selectedChannelId && (
            <span className="text-sm text-gray-500">
              # {currentServer.channels.find((c) => c.id === selectedChannelId)?.name}
            </span>
          )}
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          {channelMessages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
          ) : (
            <div className="space-y-4">
              {channelMessages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <img
                    src={message.member?.profile.imageUrl}
                    alt={message.member?.profile.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold">{message.member?.profile.name}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
