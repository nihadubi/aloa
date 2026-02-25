import { create } from "zustand";

export interface Server {
  id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  profileId: string;
  channels: Channel[];
  members: Member[];
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  type: "TEXT" | "AUDIO" | "VIDEO";
  profileId: string;
  serverId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  role: "ADMIN" | "MODERATOR" | "GUEST";
  profileId: string;
  serverId: string;
  profile: {
    id: string;
    name: string;
    imageUrl: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ServerStore {
  servers: Server[];
  currentServer: Server | null;
  setServers: (servers: Server[]) => void;
  setCurrentServer: (server: Server | null) => void;
  addServer: (server: Server) => void;
  updateServer: (server: Server) => void;
  removeServer: (serverId: string) => void;
}

export const useServerStore = create<ServerStore>((set) => ({
  servers: [],
  currentServer: null,
  setServers: (servers) => set({ servers }),
  setCurrentServer: (server) => set({ currentServer: server }),
  addServer: (server) => set((state) => ({ servers: [...state.servers, server] })),
  updateServer: (server) => set((state) => ({
    servers: state.servers.map((s) => s.id === server.id ? server : s),
    currentServer: state.currentServer?.id === server.id ? server : state.currentServer
  })),
  removeServer: (serverId) => set((state) => ({
    servers: state.servers.filter((s) => s.id !== serverId),
    currentServer: state.currentServer?.id === serverId ? null : state.currentServer
  }))
}));
