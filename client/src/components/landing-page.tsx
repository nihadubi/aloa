import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-950 text-center px-4">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Welcome to Aloa
      </h1>
      <p className="text-xl text-gray-500 mb-8 max-w-[600px]">
        The ultimate platform for connecting with your community. Join us today and start your journey.
      </p>
      <div className="flex gap-4">
        <SignInButton mode="modal">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-slate-900 text-white hover:bg-slate-900/90 h-11 px-8 cursor-pointer">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-slate-100 hover:text-slate-900 h-11 px-8 cursor-pointer">
            Sign Up
          </button>
        </SignUpButton>
      </div>
    </div>
  );
};
