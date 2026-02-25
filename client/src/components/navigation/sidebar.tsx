import { UserButton } from "@clerk/clerk-react";
import { Hash, Home, Mic, Video } from "lucide-react";

export const Sidebar = () => {
  return (
    <div className="hidden md:flex h-full w-60 flex-col fixed inset-y-0 z-20 bg-gray-100 dark:bg-gray-900 border-r md:pl-[72px]">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-xl font-bold">My App</h1>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 bg-gray-200 dark:bg-gray-800">
            <Home className="h-4 w-4" />
            Home
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
            <Hash className="h-4 w-4" />
            Channels
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
            <Mic className="h-4 w-4" />
            Voice
          </a>
          <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
            <Video className="h-4 w-4" />
            Video
          </a>
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">User Profile</span>
            <span className="text-xs text-gray-500">View settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};
