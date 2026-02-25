import { Plus, LogIn } from "lucide-react";

import { useModal } from "@/hooks/use-modal-store";

export const NavigationAction = () => {
  const { onOpen } = useModal();

  return (
    <div className="space-y-2">
      <button
        onClick={() => onOpen("createServer")}
        className="group flex items-center w-full"
        title="Create a new server"
      >
        <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500">
          <Plus
            className="group-hover:text-white transition text-emerald-500"
            size={25}
          />
        </div>
      </button>
      <button
        onClick={() => onOpen("joinServer")}
        className="group flex items-center w-full"
        title="Join a server with invite code"
      >
        <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-blue-500">
          <LogIn
            className="group-hover:text-white transition text-blue-500"
            size={25}
          />
        </div>
      </button>
    </div>
  )
}
