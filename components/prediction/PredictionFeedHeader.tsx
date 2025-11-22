"use client"

import { useState } from 'react'
import { TAssetData } from '../AssetTable'
import { SubscriptionStatus } from '../Subscription'
import { Badge } from '@/components/ui/badge'
import { Clock, ChevronsUpDown, Check } from 'lucide-react'
import Image from 'next/image'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

type PredictionFeedHeaderProps = {
  assetData: TAssetData
  allPairs: TAssetData[]
  onSelectPair: (pair: TAssetData) => void
}

export function PredictionFeedHeader({ assetData, allPairs, onSelectPair }: PredictionFeedHeaderProps) {
  const [open, setOpen] = useState(false)
  const isSubscribed = assetData.subscription === SubscriptionStatus.ACTIVE
  const isFree = assetData.subscription === SubscriptionStatus.FREE

  // Format subscription time remaining
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="relative bg-linear-to-br from-primary/10 via-primary/5 to-background p-4 border rounded-lg">
      {/* Subscription status indicator */}
      <div className="absolute top-3 right-3">
        {(isSubscribed || isFree) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`h-3 w-3 rounded-full ${isFree ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`} />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isFree
                    ? 'Free Access'
                    : `Active - ${formatTimeRemaining(assetData.secondsPerSubscription)} remaining`
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-start gap-3">
        {/* Asset logo */}
        <div className="relative h-10 w-10 shrink-0">
          <Image
            src={`/assets/icons/${assetData.baseToken}.svg`}
            alt={assetData.tokenName}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Pair selector combobox */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                role="combobox"
                aria-expanded={open}
                className="flex items-center gap-2 text-lg font-bold hover:text-primary transition-colors group"
              >
                <span>{assetData.baseToken}-{assetData.quoteToken}</span>
                <ChevronsUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search pair..." />
                <CommandList>
                  <CommandEmpty>No pair found.</CommandEmpty>
                  <CommandGroup>
                    {allPairs.map((pair) => {
                      const isSelected = pair.contract.address === assetData.contract.address
                      const pairIsFree = pair.subscription === SubscriptionStatus.FREE

                      return (
                        <CommandItem
                          key={pair.contract.address}
                          value={`${pair.baseToken}-${pair.quoteToken}-${pair.market}-${pair.interval}`}
                          onSelect={() => {
                            onSelectPair(pair)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <Image
                              src={`/assets/icons/${pair.baseToken}.svg`}
                              alt={pair.baseToken}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span className="font-semibold">
                              {pair.baseToken}-{pair.quoteToken}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {pair.market.toUpperCase()}
                            </span>
                            <Badge variant="outline" className="gap-1 text-xs ml-auto">
                              <Clock className="h-3 w-3" />
                              {pair.interval}
                            </Badge>
                            {pairIsFree && (
                              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-xs">
                                Free
                              </Badge>
                            )}
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Exchange and timeframe badges */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Exchange badge with logo */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/60 border text-xs font-medium">
              <Image
                src={assetData.market === 'binance' ? '/binance-logo.png' : '/kraken-logo.png'}
                alt={assetData.market}
                width={14}
                height={14}
              />
              <span className="uppercase">{assetData.market}</span>
            </div>

            {/* Timeframe badge */}
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {assetData.interval}
            </Badge>

            {/* Free badge */}
            {isFree && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                Free
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
