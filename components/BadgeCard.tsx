// components/BadgeCard.tsx
import React from "react";
import Link from "next/link";

interface BadgeCardProps {
  id: bigint;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ id }) => {
  const badgeId = id.toString();
  // Placeholder image URL - replace with actual logic if available
  // const imageUrl = `/images/badges/${badgeId}.png`; // Requires images in public/images/badges/
  const imageUrl = `https://via.placeholder.com/150/4F46E5/FFFFFF?text=Badge+${badgeId}`; // Placeholder

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
        </div>
      </div>
    </Link>
  );
};

export default BadgeCard;
