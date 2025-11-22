"use client"

import { useMemo } from 'react'
import { TAssetData } from '../AssetTable'
import { Card } from '@/components/ui/card'
import { ArrowUp, ArrowDown, Clock } from 'lucide-react'
import { useSocketContext } from '@/contexts/SocketContext'
import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { getSpecificPairFromContextData } from '@/contexts/MarketPriceContextHelpers'
import { formatTime } from '@/utils/appconstants'
import { SubscriptionStatus } from '../Subscription'
import LiveTime from '../elements/LiveTime'
import numeral from 'numeral'

type RelatedData = {
  nom?: string
  denom?: string
  dir?: number
  epoch?: number
}

export type LiveEpochCardProps = {
  assetData: TAssetData
  currentEpoch: number
  secondsPerEpoch: number
}

export function LiveEpochCard({
  assetData,
  currentEpoch,
  secondsPerEpoch
}: LiveEpochCardProps) {
  const { epochData } = useSocketContext()
  const { allPairsData } = useMarketPriceContext()

  const isUnlocked =
    assetData.subscription === SubscriptionStatus.ACTIVE ||
    assetData.subscription === SubscriptionStatus.FREE

  // Get live price
  const livePrice = useMemo(() => {
    if (!allPairsData) return 0
    const pairSymbol = `${assetData.baseToken}${assetData.quoteToken}`
    const price = getSpecificPairFromContextData({ allPairsData, pairSymbol })
    return parseFloat(price)
  }, [allPairsData, assetData.baseToken, assetData.quoteToken])

  // Get prediction data for live epoch
  const predictionData = useMemo(() => {
    if (!Array.isArray(epochData)) return null

    const contractData = epochData.find((data) => data.contractInfo?.address === assetData.contract.address)
    if (!contractData) return null

    const predictions = contractData.predictions.sort((a, b) => a.epoch - b.epoch)
    const foundData = predictions[1] // Live epoch is index 1

    return foundData || null
  }, [epochData, assetData.contract.address])

  const direction = predictionData?.dir
  const stakedUp = predictionData?.nom ? parseFloat(String(predictionData.nom)) : 0
  const totalStaked = predictionData?.denom ? parseFloat(String(predictionData.denom)) : 0
  const stakedDown = totalStaked - stakedUp

  const upPercentage = totalStaked > 0 ? (stakedUp / totalStaked) * 100 : 50
  const downPercentage = totalStaked > 0 ? (stakedDown / totalStaked) * 100 : 50

  const endTime = new Date((currentEpoch + secondsPerEpoch) * 1000)

  return (
    <Card className="p-6 border-primary/50 shadow-lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold">Live Epoch</h3>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ends at {formatTime(endTime)}
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1 text-sm font-mono bg-muted px-3 py-1.5 rounded-md">
            <Clock className="h-4 w-4" />
            <LiveTime
              currentEpochTimeStamp={currentEpoch}
              secondsPerEpoch={secondsPerEpoch}
            />
          </div>
        </div>

        {/* Live price */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Live Price</div>
          <div className="text-2xl font-bold">
            ${numeral(livePrice).format('0,0.00')}
          </div>
        </div>

        {isUnlocked ? (
          <>
            {/* Consensus */}
            {direction !== undefined && (
              <div className={`flex items-center gap-2 p-4 rounded-lg ${
                direction === 1
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}>
                {direction === 1 ? (
                  <>
                    <ArrowUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="text-xs text-muted-foreground">Consensus</div>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        UP
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    <div>
                      <div className="text-xs text-muted-foreground">Consensus</div>
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">
                        DOWN
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Stake distribution */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Stake Distribution</div>

              {/* Progress bar */}
              <div className="relative h-8 rounded-md overflow-hidden bg-muted">
                <div
                  className="absolute left-0 h-full bg-green-500/20 border-r-2 border-green-500 flex items-center justify-center"
                  style={{ width: `${upPercentage}%` }}
                >
                  {upPercentage > 15 && (
                    <span className="text-xs font-bold text-green-700 dark:text-green-300">
                      {upPercentage.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div
                  className="absolute right-0 h-full bg-red-500/20 border-l-2 border-red-500 flex items-center justify-center"
                  style={{ width: `${downPercentage}%` }}
                >
                  {downPercentage > 15 && (
                    <span className="text-xs font-bold text-red-700 dark:text-red-300">
                      {downPercentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Stake details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <ArrowUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">Stake UP:</span>
                    <span className="font-mono font-semibold">{numeral(stakedUp).format('0,0.00')} OCEAN</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Stake DOWN:</span>
                    <span className="font-mono font-semibold">{numeral(stakedDown).format('0,0.00')} OCEAN</span>
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  </div>
                </div>

                <div className="text-center pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Total this epoch:{' '}
                    <span className="font-semibold">{numeral(totalStaked).format('0,0.00')} OCEAN</span> staked
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center border-2 border-dashed rounded-lg bg-muted/30">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Unlock this feed to view live stake-weighted predictions
            </p>
            <p className="text-xs text-muted-foreground">
              Get access to consensus direction and stake distribution
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
