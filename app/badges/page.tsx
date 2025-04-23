"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Principal } from "@dfinity/principal";
import { getTokensOf, getPrincipal } from "@/lib/agent";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
// import Header from "@/components/header"; // Removed header import
import BadgeCard from "@/components/BadgeCard"; // Import the extracted component

// Simple Badge Card Component (can be moved to components/ later)
// const BadgeCard: React.FC<{ id: bigint }> = ({ id }) => { ... }; // REMOVED

export default function MyBadges() {
  const [badges, setBadges] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBadges = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Need to ensure user is authenticated before calling this
        // getPrincipal will throw if not authenticated, handled by catch
        const principal = await getPrincipal();
        const ownedTokens = await getTokensOf(principal);
        setBadges(ownedTokens);
      } catch (err) {
        console.error("Error fetching badges:", err);
        setError(
          `Failed to load badges. ${
            err instanceof Error &&
            err.message.includes("User is not authenticated")
              ? "Please connect your wallet/log in." // Updated message
              : "Please try again later."
          }`
        );
        // Optional: Redirect to login/home if auth error?
        // if (err instanceof Error && err.message.includes("User is not authenticated")) {
        //   // Could trigger login via agent or redirect
        //   // Example: router.push('/'); // Redirect home
        // }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, []); // Fetch on mount

  return (
    // <main className="min-h-screen flex flex-col"> // Removed
    // <Header /> // Removed

    <div className="container max-w-4xl mx-auto px-4 py-12">
      {" "}
      {/* Content starts directly with container */}
      <h1 className="text-3xl font-bold mb-8">My Badges</h1>
      {isLoading && <p className="text-gray-600">Loading your badges...</p>}
      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded border border-red-300">
          {error}
        </p>
      )}
      {!isLoading && !error && badges.length === 0 && (
        <div className="text-center py-10 px-6 bg-gray-100 rounded-lg">
          <p className="text-lg text-gray-600 mb-4">
            You don't own any EarlyBirdBadges yet.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg"
          >
            Claim Your Badge
          </Button>
        </div>
      )}
      {!isLoading && !error && badges.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {badges.map((badgeId) => (
            <BadgeCard key={badgeId.toString()} id={badgeId} />
          ))}
        </div>
      )}
    </div>
    // </main> // Removed
  );
}
