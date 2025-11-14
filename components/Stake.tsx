'use client'

import { useMemo } from 'react'
import { Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Stake({
  totalStake,
  totalStakePreviousDay
}: {
  totalStake: number
  totalStakePreviousDay: number
}) {
  // Calculate the percentage change (delta)
  const delta = useMemo(() => {
    if (totalStakePreviousDay === 0) {
      return totalStake === 0 ? 0 : 100
    }
    return ((totalStake - totalStakePreviousDay) / totalStakePreviousDay) * 100
  }, [totalStake, totalStakePreviousDay])

  // Format the delta for display
  const formattedDelta = useMemo(() => {
    const sign = delta >= 0.5 ? '+' : delta < 0 ? '-' : ''
    return `${sign}${Math.abs(delta).toFixed(0)}%`
  }, [delta])

  // Determine the color class based on the delta value
  const deltaColorClass = useMemo(() => {
    if (delta > 0.5) {
      return 'text-green-600 dark:text-green-500'
    } else if (delta < 0) {
      return 'text-red-600 dark:text-red-500'
    }
    return 'text-muted-foreground'
  }, [delta])

  return (
    <div className="flex flex-col gap-1 px-2 py-1">
      <div className="flex items-center gap-1.5">
        <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-semibold tabular-nums">
          {totalStake.toFixed(1)}
        </span>
      </div>
      <span className={cn("text-xs font-medium tabular-nums", deltaColorClass)}>
        {formattedDelta}
      </span>
    </div>
  )
}
