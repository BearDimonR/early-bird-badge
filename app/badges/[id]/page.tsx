"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { transferBadge } from "@/lib/agent";
import Image from "next/image";
import { Principal } from "@dfinity/principal";

export default function BadgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const badgeIdStr = params.id as string;
  const [recipientPrincipal, setRecipientPrincipal] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  let badgeId: bigint | null = null;
  try {
    badgeId = BigInt(badgeIdStr);
  } catch (e) {
    console.error("Invalid badge ID:", badgeIdStr);
  }

  const imageUrl =
    badgeId !== null
      ? `https://via.placeholder.com/400/4F46E5/FFFFFF?text=Badge+${badgeId}`
      : `https://via.placeholder.com/400/CCCCCC/FFFFFF?text=Invalid+ID`;

  const explorerUrl =
    process.env.NEXT_PUBLIC_CANISTER_ID && badgeId !== null
      ? `https://dashboard.internetcomputer.org/canister/${process.env.NEXT_PUBLIC_CANISTER_ID}/nft/${badgeId}`
      : "#";

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeId) {
      toast({
        title: "Error",
        description: "Invalid Badge ID.",
        variant: "destructive",
      });
      return;
    }
    if (!recipientPrincipal.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipient Principal ID.",
        variant: "destructive",
      });
      return;
    }
    setIsTransferring(true);
    setTransferError(null);
    try {
      const toPrincipal = Principal.fromText(recipientPrincipal.trim());
      await transferBadge(toPrincipal, badgeId);
      toast({
        title: "Transfer Initiated",
        description: `Transferring Badge #${badgeId} to ${toPrincipal.toText()}. This may take a moment.`,
      });
      setRecipientPrincipal("");
      setTimeout(() => router.push("/badges"), 2000);
    } catch (error) {
      console.error("Transfer failed:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setTransferError(`Transfer failed: ${errorMsg}`);
      toast({
        title: "Transfer Failed",
        description:
          errorMsg.includes("not found") || errorMsg.includes("not owner")
            ? "You might not own this badge or it doesn't exist."
            : errorMsg.includes("Principal")
            ? "Invalid recipient Principal ID format."
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleViewOnExplorer = () => {
    const viewUrl = explorerUrl;
    if (viewUrl !== "#") {
      window.open(viewUrl, "_blank");
    } else {
      toast({
        title: "Error",
        description: "Explorer URL is not available.",
        variant: "destructive",
      });
    }
  };

  if (badgeId === null) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Invalid Badge ID
        </h1>
        <p className="text-gray-600">
          The badge ID "{badgeIdStr}" is not valid.
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/badges")}
      >
        ← Back to My Badges
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-md mb-4 rounded-lg overflow-hidden border">
            <Image
              src={imageUrl}
              alt={`Badge #${badgeId}`}
              width={400}
              height={400}
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-6">
            Badge #{badgeId.toString()}
          </h1>

          <div className="space-y-6">
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={handleViewOnExplorer}
              disabled={explorerUrl === "#"}
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </Button>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Share className="h-5 w-5" />
                  Share Badge
                </h2>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="principal"
                      className="block text-sm font-medium mb-1"
                    >
                      Recipient Principal ID
                    </label>
                    <Input
                      id="principal"
                      placeholder="Enter principal ID"
                      value={recipientPrincipal}
                      onChange={(e) => setRecipientPrincipal(e.target.value)}
                    />
                  </div>

                  {transferError && (
                    <p className="text-sm text-red-600 mb-3">{transferError}</p>
                  )}

                  <Button
                    className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg"
                    onClick={handleTransfer}
                    disabled={isTransferring || !recipientPrincipal.trim()}
                    type="button"
                  >
                    {isTransferring ? "Transferring..." : "Transfer Badge"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
