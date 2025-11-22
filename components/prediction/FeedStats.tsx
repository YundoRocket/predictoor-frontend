"use client"

import { useMemo } from "react"
import { TAssetData } from "../AssetTable"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Target, TrendingUp, TrendingDown } from "lucide-react"
import { useAccuracyContext } from "@/contexts/AccuracyContext"
import { getAccuracyStatisticsByTokenName } from "@/contexts/AccuracyContextHelpers"
import { useTimeFrameContext } from "@/contexts/TimeFrameContext"
import Subscription, { SubscriptionStatus } from "../Subscription"
import numeral from "numeral"

export type FeedStatsProps = {
  assetData: TAssetData
}

export function FeedStats({ assetData }: FeedStatsProps) {
  const { accuracyStatistics } = useAccuracyContext()
  const { timeFrameInterval } = useTimeFrameContext()

  const accuracyData = useMemo(() => {
    if (!assetData.contract) return null

    return getAccuracyStatisticsByTokenName({
      contractAddress: assetData.contract.address,
      accuracyData: accuracyStatistics,
      timeFrameInterval
    })
  }, [assetData.contract, accuracyStatistics, timeFrameInterval])

  const accuracy7d = accuracyData?.average_accuracy ?? 0
  const totalStake24h = accuracyData?.total_staked_today ?? 0
  const totalStakeYesterday = accuracyData?.total_staked_yesterday ?? 0

  // Calculate stake change percentage
  const stakeChange = totalStakeYesterday > 0
    ? ((totalStake24h - totalStakeYesterday) / totalStakeYesterday) * 100
    : 0

  const isUnlocked =
    assetData.subscription === SubscriptionStatus.ACTIVE ||
    assetData.subscription === SubscriptionStatus.FREE

  const formatPercent = (value: number) =>
    `${numeral(value).format("0,0.0")}%`

  const accuracyColor =
    accuracy7d >= 60
      ? "text-emerald-500"
      : accuracy7d >= 50
      ? "text-amber-500"
      : "text-red-500"

  const changeColor =
    stakeChange > 0
      ? "text-emerald-500"
      : stakeChange < 0
      ? "text-red-500"
      : "text-muted-foreground"

  const subscriptionDurationHours = Math.floor(
    assetData.secondsPerSubscription / 3600
  )

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">
          Performance &amp; Usage
        </h3>

        {!accuracyData && (
          <span className="text-xs text-muted-foreground">
            No historical data yet
          </span>
        )}
      </div>

      {/* 3 Columns Large Screen / 1 Column on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* -------- COLUMN 1 : ACCURACY -------- */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>Accuracy (last 7 days)</span>
          </div>

          <div className={`text-4xl font-semibold ${accuracyColor}`}>
            {formatPercent(accuracy7d)}
          </div>

          <p className="text-xs text-muted-foreground">
            Stake-weighted hit rate for this prediction feed over the past week.
          </p>
        </div>

        {/* -------- COLUMN 2 : STAKE -------- */}
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Total Stake (24h)</div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold">
              {numeral(totalStake24h).format("0,0.00")}
            </span>
            <span className="text-sm text-muted-foreground">OCEAN</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {stakeChange !== 0 ? (
              <>
                {stakeChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}

                <span className={changeColor}>
                  {formatPercent(Math.abs(stakeChange))}
                </span>

                <span className="text-muted-foreground">
                  vs previous 24h
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">
                Stable vs previous 24h
              </span>
            )}
          </div>
        </div>

        {/* -------- COLUMN 3 : SUBSCRIPTION -------- */}
        <div className="space-y-3 border-t pt-4 lg:border-t-0 lg:border-l lg:pl-6 border-border/50">

          {/* LOCKED VIEW */}
          {!isUnlocked && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Unlock full access</div>

              <p className="text-xs text-muted-foreground">
                Unlock live predictions and full stake breakdown for this feed.
              </p>

              <Subscription
                subscriptionData={{
                  status: assetData.subscription,
                  secondsPerSubscription: assetData.secondsPerSubscription,
                  price: parseFloat(assetData.subscriptionPrice),
                }}
                contractAddress={assetData.contract.address}
              />
            </div>
          )}

          {/* ACTIVE SUB */}
          {assetData.subscription === SubscriptionStatus.ACTIVE && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-emerald-500">
                ✓ Feed Unlocked
              </div>
              <div className="text-xs text-muted-foreground">
                Access expires in {subscriptionDurationHours}h
              </div>
            </div>
          )}

          {/* FREE FEED */}
          {assetData.subscription === SubscriptionStatus.FREE && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-sky-500">✓ Free Feed</div>
              <div className="text-xs text-muted-foreground">
                Provided by Ocean Protocol Foundation
              </div>
            </div>
          )}
        </div>

      </div>
    </Card>
  )
}
