"use client"

import { TAssetData } from '../AssetTable'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { SubscriptionStatus } from '../Subscription'

export type PairSelectorProps = {
  pairs: TAssetData[]
  selectedPair: TAssetData | null
  onSelectPair: (pair: TAssetData) => void
}

export function PairSelector({ pairs, selectedPair, onSelectPair }: PairSelectorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {pairs.map((pair) => {
          const isSelected = selectedPair?.contract.address === pair.contract.address
          const isFree = pair.subscription === SubscriptionStatus.FREE

          return (
            <button
              key={pair.contract.address}
              onClick={() => onSelectPair(pair)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all shrink-0
                ${isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card hover:bg-accent hover:border-accent-foreground/20'
                }
              `}
            >
              {/* Token icon */}
              <div className="relative h-6 w-6 shrink-0">
                <Image
                  src={`/assets/icons/${pair.baseToken}.svg`}
                  alt={pair.baseToken}
                  width={pair.baseToken === 'ETH' ? 16 : 24}
                  height={pair.baseToken === 'ETH' ? 16 : 24}
                  className="rounded-full"
                />
              </div>

              {/* Pair name */}
              <span className="font-semibold text-sm whitespace-nowrap">
                {pair.baseToken}-{pair.quoteToken}
              </span>

              {/* Exchange */}
              <span className={`text-xs ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}>
                {pair.market.toUpperCase()}
              </span>

              {/* Timeframe */}
              <Badge
                variant={isSelected ? "secondary" : "outline"}
                className="gap-1 text-xs"
              >
                <Clock className="h-3 w-3" />
                {pair.interval}
              </Badge>

              {/* Free badge */}
              {isFree && (
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                  }`}
                >
                  Free
                </Badge>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
