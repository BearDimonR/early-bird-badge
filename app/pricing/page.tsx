"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { checkBadgeOwnership } from "@/lib/agent";
import { useRouter } from "next/navigation";

interface PricingPlan {
  name: string;
  standardPrice: number;
  holderPrice: number;
  features: string[];
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Basic Access",
    standardPrice: 10,
    holderPrice: 8,
    features: [
      "Core platform access",
      "Basic analytics",
      "Standard support",
      "1 project",
    ],
  },
  {
    name: "Pro Access",
    standardPrice: 25,
    holderPrice: 20,
    features: [
      "Everything in Basic",
      "Advanced analytics",
      "Priority support",
      "5 projects",
      "API access",
    ],
  },
];

const ACCENT_COLOR = "#4F46E5";

export default function Pricing() {
  const [hasBadge, setHasBadge] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkOwnership = async () => {
      setIsLoading(true);
      try {
        const ownerStatus = await checkBadgeOwnership();
        setHasBadge(ownerStatus);
      } catch (error) {
        console.error("Error checking badge ownership:", error);
        setHasBadge(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOwnership();
  }, []);

  const handleSubscribe = (plan: string) => {
    console.log(`Subscribing to ${plan} plan`);
    alert(`This is a demo. Subscription to ${plan} plan is not implemented.`);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Pricing Plans</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {isLoading
            ? "Checking badge status..."
            : hasBadge
            ? "As an EarlyBirdBadge holder, you get exclusive discounts on all plans!"
            : "Subscribe to access our platform. Badge holders get special discounts!"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Loading pricing information...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {pricingPlans.map((plan) => (
            <Card key={plan.name} className="overflow-hidden rounded-lg">
              <CardContent className="p-0">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">
                    {plan.name}
                  </h2>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: hasBadge ? ACCENT_COLOR : "inherit" }}
                    >
                      {hasBadge ? plan.holderPrice : plan.standardPrice}
                    </span>
                    {hasBadge && (
                      <span className="text-sm line-through text-muted-foreground">
                        {plan.standardPrice}
                      </span>
                    )}
                    <span className="text-muted-foreground">ICP/mo</span>
                  </div>

                  {hasBadge && (
                    <div
                      className="text-sm p-2 rounded-md mb-4"
                      style={{
                        backgroundColor: `${ACCENT_COLOR}1A`,
                        color: ACCENT_COLOR,
                      }}
                    >
                      Badge holder discount applied!
                    </div>
                  )}

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <Check
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: ACCENT_COLOR }}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 pt-0">
                  <Button
                    className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg"
                    onClick={() => handleSubscribe(plan.name)}
                  >
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !hasBadge && (
        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-600">
            Want to get the discounted prices?
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg"
          >
            Claim Your Badge
          </Button>
        </div>
      )}
    </div>
  );
}
