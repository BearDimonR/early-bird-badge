// components/BadgeCard.tsx
import React from "react";
import Link from "next/link";
import { Badge } from "../src/declarations/early_bird_badge/early_bird_badge.did";

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const badgeId = badge.id.toString();
  // Placeholder image URL - replace with actual logic if available
  // const imageUrl = `/images/badges/${badgeId}.png`; // Requires images in public/images/badges/
  const imageUrl = `/images/early-adopter-badge.png`; // Placeholder

  return (
    <Link href={`/badges/${badgeId}`}>
      <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white">
        <img
          src={imageUrl}
          alt={`Badge #${badgeId}`}
          className="w-full h-32 object-cover"
        />
        <div className="p-4">
          <p className="font-semibold text-center text-gray-700">
            Badge #{badgeId}
          </p>
          <p className="text-sm text-center text-gray-500 mt-2">
            {badge.metadata}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BadgeCard;
