"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function BadgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const badgeIdStr = params.id as string;

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
                <h2 className="text-xl font-semibold mb-4">
                  Early Bird Badge Details
                </h2>
                <p className="text-gray-600">
                  This is your unique Early Bird Badge. It represents your early
                  participation in the project.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
