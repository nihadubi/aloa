import { ClerkProvider, SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/landing-page";
import { Dashboard } from "./components/dashboard";
import { SocketProvider } from "./components/providers/socket-provider";
import { ModalProvider } from "./components/providers/modal-provider";
import MainLayout from "./components/layouts/main-layout";
import { ServerIdPage } from "./components/server/server-id-page";
import { useEffect } from "react";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

if (!clerkPubKey) {
  console.error("❌ Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
  console.log("📝 Available env vars:", Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
}

const AuthSync = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const syncUser = async () => {
        try {
          const response = await fetch(`${apiUrl}/api/auth/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              name: user.fullName,
              imageUrl: user.imageUrl,
              email: user.primaryEmailAddress?.emailAddress,
            }),
          });
          
          if (!response.ok) {
            console.warn("Auth sync failed:", response.statusText);
          }
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      };

      syncUser();
    }
  }, [user]);

  return null;
};

function App() {
  if (!clerkPubKey) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-6 bg-red-100 text-red-800 rounded-lg max-w-md">
          <h2 className="text-lg font-bold mb-2">⚠️ Configuration Error</h2>
          <p className="mb-4">Missing <code className="bg-red-200 px-2 py-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> in your <code className="bg-red-200 px-2 py-1 rounded">.env</code> file.</p>
          <p className="text-sm">Please add it to <code className="bg-red-200 px-2 py-1 rounded">client/.env</code>:</p>
          <pre className="bg-red-200 p-2 rounded mt-2 text-xs overflow-auto">VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</pre>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <SocketProvider>
        <ModalProvider />
        <SignedOut>
          <LandingPage />
        </SignedOut>
        <SignedIn>
          <AuthSync />
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/servers/:serverId" element={<ServerIdPage />} />
            </Routes>
          </MainLayout>
        </SignedIn>
      </SocketProvider>
    </ClerkProvider>
  );
}

export default App;
