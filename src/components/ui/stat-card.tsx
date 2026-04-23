import * as React from "react"
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    direction: "up" | "down" | "neutral"
  }
  loading?: boolean
  size?: "default" | "sm"
  className?: string
}

function StatCard({
  title,
  value,
  trend,
  loading = false,
  size = "default",
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <Card size={size} className={className}>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-16" />
        </CardContent>
      </Card>
    )
  }

  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUpIcon
      : trend?.direction === "down"
        ? TrendingDownIcon
        : MinusIcon

  const trendColor =
    trend?.direction === "up"
      ? "text-emerald-500"
      : trend?.direction === "down"
        ? "text-red-500"
        : "text-muted-foreground"

  return (
    <Card size={size} className={className}>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground mb-1">{title}</div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {trend && (
          <div className={cn("flex items-center gap-1 mt-1 text-sm", trendColor)}>
            <TrendIcon className="size-4" />
            <span>{trend.value}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { StatCard }
