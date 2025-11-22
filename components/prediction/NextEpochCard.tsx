"use client"

import { useMemo } from 'react'
import { TAssetData } from '../AssetTable'
import { Card } from '@/components/ui/card'
import { ArrowUp, ArrowDown, Lock } from 'lucide-react'
import { useSocketContext } from '@/contexts/SocketContext'
import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { getSpecificPairFromContextData } from '@/contexts/MarketPriceContextHelpers'
import { formatTime } from '@/utils/appconstants'
import { SubscriptionStatus } from '../Subscription'
import numeral from 'numeral'

type RelatedData = {
  nom?: string
  denom?: string
  dir?: number
  epoch?: number
}

export type NextEpochCardProps = {
  assetData: TAssetData
  currentEpoch: number
  secondsPerEpoch: number
}

export function NextEpochCard({
  assetData,
  currentEpoch,
  secondsPerEpoch
}: NextEpochCardProps) {
  const { epochData } = useSocketContext()
  const { allPairsData } = useMarketPriceContext()

  const isUnlocked =
    assetData.subscription === SubscriptionStatus.ACTIVE ||
    assetData.subscription === SubscriptionStatus.FREE

  // Get live price as reference
  const referencePrice = useMemo(() => {
    if (!allPairsData) return 0
    const pairSymbol = `${assetData.baseToken}${assetData.quoteToken}`
    const price = getSpecificPairFromContextData({ allPairsData, pairSymbol })
    return parseFloat(price)
  }, [allPairsData, assetData.baseToken, assetData.quoteToken])

  // Get prediction data for next epoch
  const predictionData = useMemo(() => {
    if (!Array.isArray(epochData)) return null

    const foundData = epochData
      ?.find((data) => data.contractInfo?.address === assetData.contract.address)
      ?.predictions.sort((a, b) => a.epoch - b.epoch)[2]

    return foundData || null
  }, [epochData, assetData.contract.address])

  const direction = predictionData?.dir
  const stakedUp = predictionData?.nom ? parseFloat(String(predictionData.nom)) : 0
  const totalStaked = predictionData?.denom ? parseFloat(String(predictionData.denom)) : 0
  const stakedDown = totalStaked - stakedUp

  const upPercentage = totalStaked > 0 ? (stakedUp / totalStaked) * 100 : 50
  const downPercentage = totalStaked > 0 ? (stakedDown / totalStaked) * 100 : 50

  const nextEpochStart = new Date((currentEpoch + secondsPerEpoch) * 1000)
  const nextEpochEnd = new Date((currentEpoch + 2 * secondsPerEpoch) * 1000)

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-bold mb-1">Next Epoch</h3>
          <p className="text-sm text-muted-foreground">
            {formatTime(nextEpochStart)} - {formatTime(nextEpochEnd)}
          </p>
        </div>

        {/* Reference price */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Reference Price</div>
          <div className="text-2xl font-bold">
            ${numeral(referencePrice).format('0,0.00')}
          </div>
        </div>

        {isUnlocked ? (
          <>
            {direction !== undefined ? (
              <>
                {/* Prediction direction */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  direction === 1
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}>
                  {direction === 1 ? (
                    <>
                      <ArrowUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-bold text-green-600 dark:text-green-400">
                        Prediction: UP
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <span className="font-bold text-red-600 dark:text-red-400">
                        Prediction: DOWN
                      </span>
                    </>
                  )}
                </div>

                {/* Stake distribution if available */}
                {totalStaked > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Early Stakes</div>

                    {/* Progress bar */}
                    <div className="relative h-6 rounded-md overflow-hidden bg-muted">
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
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <ArrowUp className="h-4 w-4 text-green-600" />
                        <span className="font-mono font-semibold">{stakedUp} OCEAN</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold">{stakedDown} OCEAN</span>
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-6 text-center border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Waiting for predictions...
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-center border-2 border-dashed rounded-lg">
            <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Unlock to view next epoch predictions
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
