import { SocketIndicator } from "./socket-indicator";
import { NavigationSidebar } from "./navigation/navigation-sidebar";

export const Dashboard = () => {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="flex-1 md:pl-60 p-6 h-full">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <SocketIndicator />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             {/* Dashboard Content */}
             <div className="p-6 bg-white dark:bg-zinc-800/50 border rounded-xl shadow-sm">
                <h3 className="font-semibold mb-2">Total Servers</h3>
                <p className="text-3xl font-bold">0</p>
             </div>
             <div className="p-6 bg-white dark:bg-zinc-800/50 border rounded-xl shadow-sm">
                <h3 className="font-semibold mb-2">Active Channels</h3>
                <p className="text-3xl font-bold">0</p>
             </div>
        </div>
        <p className="mt-8 text-muted-foreground">Welcome back! Select a channel or server to get started.</p>
      </main>
    </div>
  );
};
