"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Principal } from "@dfinity/principal";
import {
  getPrincipal,
  hasBadge,
  getBadge,
  checkAuthentication,
} from "@/lib/agent";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
// import Header from "@/components/header"; // Removed header import
import BadgeCard from "@/components/BadgeCard"; // Import the extracted component

// Simple Badge Card Component (can be moved to components/ later)
// const BadgeCard: React.FC<{ id: bigint }> = ({ id }) => { ... }; // REMOVED

export default function MyBadges() {
  const [badge, setBadge] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBadge = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Check authentication first
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) {
          setError("Please log in to view your badges.");
          return; // Exit early if not authenticated
        }

        const principal = await getPrincipal();
        const hasABadge = await hasBadge();
        if (hasABadge) {
          const badgeDetails = await getBadge();
          setBadge(badgeDetails);
        }
      } catch (err) {
        console.error("Error fetching badge:", err);
        setError(
          `Failed to load badge. ${
            err instanceof Error &&
            err.message.includes("User is not authenticated")
              ? "Please connect your wallet/log in."
              : "Please try again later."
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadge();
  }, []);

  return (
    // <main className="min-h-screen flex flex-col"> // Removed
    // <Header /> // Removed

    <div className="container max-w-4xl mx-auto px-4 py-12">
      {" "}
      {/* Content starts directly with container */}
      <h1 className="text-3xl font-bold mb-8">My Badge</h1>
      {isLoading && <p className="text-gray-600">Loading your badge...</p>}
      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded border border-red-300">
          {error}
        </p>
      )}
      {!isLoading && !error && !badge && (
        <div className="text-center py-10 px-6 bg-gray-100 rounded-lg">
          <p className="text-lg text-gray-600 mb-4">
            You don't own an Early Bird Badge yet.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg"
          >
            Claim Your Badge
          </Button>
        </div>
      )}
      {!isLoading && !error && badge && (
        <div className="grid grid-cols-1 gap-6">
          <BadgeCard badge={badge} />
        </div>
      )}
    </div>
    // </main> // Removed
  );
}
