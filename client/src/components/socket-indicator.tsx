import { useSocket } from "./providers/socket-provider";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <div className="bg-yellow-600 text-white border-none px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
        Polling...
      </div>
    )
  }

  return (
    <div className="bg-emerald-600 text-white border-none px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
      Live: Real-time updates
    </div>
  )
}
