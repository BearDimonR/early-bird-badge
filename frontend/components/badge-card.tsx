"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface BadgeCardProps {
  id: number
  onClick: () => void
}

export default function BadgeCard({ id, onClick }: BadgeCardProps) {
  return (
    <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
      <div className="relative aspect-square">
        <Image src={`/placeholder.svg?height=300&width=300`} alt={`Badge #${id}`} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-center">Badge #{id}</h3>
      </CardContent>
    </Card>
  )
}
