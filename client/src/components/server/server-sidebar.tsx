interface Server {
  id: string;
  name: string;
  channels: {
    id: string;
    name: string;
    type: string;
  }[];
}

interface ServerSidebarProps {
  server: Server;
  selectedChannelId?: string | null;
  onSelectChannel?: (channelId: string) => void;
}

export const ServerSidebar = ({ server, selectedChannelId, onSelectChannel }: ServerSidebarProps) => {
  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <div className="flex items-center h-12 border-b border-primary/10 px-3 shadow-sm">
        <h1 className="font-semibold text-md truncate font-sans">{server.name}</h1>
      </div>
      <div className="flex-1 px-3 py-2">
        <div className="mb-2">
            <h2 className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Channels</h2>
            {server.channels.map((channel) => (
            <div 
              key={channel.id} 
              onClick={() => onSelectChannel?.(channel.id)}
              className={`group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1 cursor-pointer ${
                selectedChannelId === channel.id ? 'bg-zinc-700/20 dark:bg-zinc-700/50' : ''
              }`}
            >
                <p className={`font-semibold text-sm transition ${
                  selectedChannelId === channel.id 
                    ? 'text-zinc-600 dark:text-zinc-200' 
                    : 'text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300'
                }`}>
                 # {channel.name}
                </p>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}
