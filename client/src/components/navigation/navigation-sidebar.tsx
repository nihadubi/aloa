import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";
import { useServerStore } from "@/hooks/use-server-store";
import type { Server } from "@/hooks/use-server-store";

export const NavigationSidebar = () => {
  const { user } = useUser();
  const { servers, setServers } = useServerStore();

  useEffect(() => {
    if (!user) return;

    const fetchServers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/servers`, {
          params: { userId: user.id }
        });
        setServers(response.data);
      } catch (error) {
        console.log("Failed to fetch servers", error);
      }
    }

    fetchServers();
  }, [user, setServers]);

  return (
    <div
      className="space-y-4 flex flex-col items-center h-full text-primary w-full bg-[#E3E5E8] dark:bg-[#1E1F22] py-3"
    >
      <NavigationAction />
      <div className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
      <div className="flex-1 w-full overflow-y-auto scrollbar-hide">
        <div className="space-y-4 flex flex-col items-center pb-3">
            {servers.map((server: Server) => (
              <NavigationItem
                key={server.id}
                id={server.id}
                name={server.name}
                imageUrl={server.imageUrl}
              />
            ))}
        </div>
      </div>
    </div>
  )
}
