"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import {
  getRemainingSupply,
  checkBadgeOwnership,
  mintBadge,
  checkAuthentication,
} from "@/lib/agent";

export default function Home() {
  const [remainingSupply, setRemainingSupply] = useState<bigint | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const supply = await getRemainingSupply();
      setRemainingSupply(supply);

      // Only check ownership if the user is authenticated
      const isAuthenticated = await checkAuthentication();
      if (isAuthenticated) {
        const ownerStatus = await checkBadgeOwnership();
        setIsOwner(ownerStatus);
      } else {
        setIsOwner(false); // Assume not an owner if not authenticated
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Could not fetch badge data. Please try refreshing.",
        variant: "destructive",
      });
      setRemainingSupply(null);
      setIsOwner(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await checkAuthentication();
      setIsAuthenticated(authStatus);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    refreshData();
  }, []);

  const handleMint = async () => {
    setIsLoading(true);
    try {
      // Check authentication first
      const isAuthenticated = await checkAuthentication();
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to claim your badge.",
          variant: "destructive",
        });
        return; // Exit early if not authenticated
      }

      const tokenId = await mintBadge();

      toast({
        title: "Success!",
        description: `Your EarlyBirdBadge #${tokenId.toString()} has been minted successfully.`,
      });

      await refreshData();
    } catch (error) {
      console.error("Error minting badge (in component):", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isClaimDisabled =
    isLoading ||
    remainingSupply === null ||
    remainingSupply <= BigInt(0) ||
    isOwner ||
    !isAuthenticated;

  return (
    <div className="flex-1 container max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
      <div className="bg-secondary/50 w-full max-w-xs py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-8">
        <Trophy className="h-5 w-5 text-primary" />
        <p className="text-lg font-medium">
          Remaining:{" "}
          {remainingSupply === null
            ? "Loading..."
            : `${remainingSupply.toString()} / 100`}
        </p>
      </div>

      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Get Your EarlyBirdBadge</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Claim your exclusive EarlyBirdBadge NFT to unlock special discounts
          and benefits across our platform.
        </p>
      </div>

      <Button
        size="lg"
        className="px-8 py-6 text-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg"
        onClick={handleMint}
        disabled={isClaimDisabled}
      >
        {isLoading
          ? "Checking Status..."
          : isOwner
          ? "Badge Claimed"
          : remainingSupply !== null && remainingSupply <= BigInt(0)
          ? "All Claimed"
          : "Claim Your Badge"}
      </Button>

      {!isLoading && isOwner && (
        <p className="mt-4 text-sm text-muted-foreground">
          You already own an EarlyBirdBadge. Check it out in{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-indigo-600 hover:underline"
            onClick={() => router.push("/badges")}
          >
            My Badges
          </Button>
          .
        </p>
      )}

      {!isLoading &&
        remainingSupply !== null &&
        remainingSupply <= BigInt(0) &&
        !isOwner && (
          <p className="mt-4 text-sm text-muted-foreground">
            All badges have been claimed.
          </p>
        )}
    </div>
  );
}
