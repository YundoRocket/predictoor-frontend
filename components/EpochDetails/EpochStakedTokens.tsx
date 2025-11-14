import { ArrowUp, ArrowDown, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SubscriptionStatus } from '../Subscription'

export type TEpochStakedTokensProps = {
  showLabel?: boolean | undefined
  stakedUp?: number | undefined
  direction?: number | undefined
  totalStaked?: number | undefined
  subscription?: SubscriptionStatus
}

export const EpochStakedTokens: React.FC<TEpochStakedTokensProps> = ({
  stakedUp,
  totalStaked,
  direction,
  showLabel
}) => {
  const formatStake = (value: number) => {
    if (value <= 0) return '0'
    if (value >= 0.01) return value.toLocaleString()
    return '<0.01'
  }

  const stakedUpValue = stakedUp && stakedUp > 0 ? stakedUp : 0
  const stakedDownValue = totalStaked && stakedUp !== undefined && totalStaked - stakedUp > 0
    ? totalStaked - stakedUp
    : 0

  return !showLabel ? (
    <div className="flex items-center gap-2">
      {/* Staked Up */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium tabular-nums">
          {formatStake(stakedUpValue)}
        </span>
        <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-500" />
      </div>

      {/* Staked Down */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium tabular-nums">
          {formatStake(stakedDownValue)}
        </span>
        <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-500" />
      </div>
    </div>
  ) : (
    <div className={cn(
      "flex items-center gap-2",
      "h-[25px] w-full pt-1.5"
    )}>
      <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <span className="text-sm font-medium">
        {direction === undefined
          ? '?'
          : totalStaked
          ? totalStaked.toLocaleString()
          : 0}
        {showLabel && ' staked'}
      </span>
    </div>
  )
}
