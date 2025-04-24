"use client"; // Required for useState, useEffect, and event handlers

import React, { useState, useEffect, useCallback } from "react"; // Import hooks
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation"; // For potential redirects after login/logout
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button"; // Import Button
import { AuthClient } from "@dfinity/auth-client"; // Import AuthClient for status check
import { logout, createBadgeActor } from "@/lib/agent"; // Import agent functions

const inter = Inter({ subsets: ["latin"] });

// Note: Exporting metadata from a Client Component is not supported.
// Move metadata to the page level or a Server Component parent if needed.
// export const metadata: Metadata = { ... };

// Simple Header Component now includes Login/Logout logic
const AppHeader: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true); // Check auth status on load
  const router = useRouter();

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      // We need to create AuthClient directly here to check status without triggering login
      const authClient = await AuthClient.create();
      const authStatus = await authClient.isAuthenticated();
      setIsAuthenticated(authStatus);
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setIsAuthenticated(false); // Assume not authenticated on error
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async () => {
    setIsAuthLoading(true);
    try {
      // Calling createBadgeActor triggers the login flow if not authenticated
      await createBadgeActor();
      setIsAuthenticated(true); // Assume success if no error
      // Optionally redirect or refresh data, depends on desired UX
      // window.location.reload(); // Simple refresh
    } catch (error) {
      console.error("Login failed:", error);
      setIsAuthenticated(false);
    } finally {
      setIsAuthLoading(false);
      // Refresh auth status just in case
      await checkAuth();
    }
  };

  const handleLogout = async () => {
    setIsAuthLoading(true);
    try {
      await logout(); // Call the logout function from agent
      setIsAuthenticated(false);
      // Redirect to home page after logout
      router.push("/");
      // window.location.reload(); // Alternative: simple refresh
    } catch (error) {
      console.error("Logout failed:", error);
      // Might still be authenticated if logout failed? Re-check?
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and Title */}
        <Link
          href="/"
          className="text-xl font-semibold text-gray-800 flex items-center"
        >
          {" "}
          {/* Added flex */}
          <span className="mr-2">🏅</span>
          EarlyBirdBadge
        </Link>

        {/* Navigation Links & Auth Button */}
        <div className="flex items-center space-x-4">
          {" "}
          {/* Use flex container */}
          <Link href="/badges" className="text-gray-600 hover:text-indigo-600">
            My Badges
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/pricing" className="text-gray-600 hover:text-indigo-600">
            Pricing
          </Link>
          {/* Conditional Login/Logout Button */}
          <div className="ml-4">
            {" "}
            {/* Add margin */}
            {isAuthLoading ? (
              <Button size="sm" disabled>
                Checking...
              </Button>
            ) : isAuthenticated ? (
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg"
                onClick={handleLogin}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AppHeader /> {/* Header now contains auth logic */}
          <main className="container mx-auto px-4 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
