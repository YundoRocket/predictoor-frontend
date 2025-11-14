'use client'

import { TokenData } from '@/utils/asset'
import { useEffect, useMemo, useState } from 'react'

import { useAccuracyContext } from '@/contexts/AccuracyContext'
import { getAccuracyStatisticsByTokenName } from '@/contexts/AccuracyContextHelpers'
import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { getSpecificPairFromContextData } from '@/contexts/MarketPriceContextHelpers'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useSocketContext } from '@/contexts/SocketContext'
import { useTimeFrameContext } from '@/contexts/TimeFrameContext'
import { TableRowWrapper } from './elements/TableRowWrapper'
import Accuracy from './Accuracy'
import Asset from './Asset'
import { TAssetData } from './AssetTable'
import { EEpochDisplayStatus, EpochDisplay } from './EpochDisplay'
import Price from './Price'
import Stake from './Stake'
import Subscription, { SubscriptionStatus } from './Subscription'

export type TAssetFetchedInfo = {
  tokenData: TokenData | undefined
  price: string
}

export type TAssetRowProps = {
  assetData: TAssetData
}

export type TAssetRowState = {
  FetchedInfo: TAssetFetchedInfo | undefined
  tokenAccuracyStake: {
    accuracy: number
    totalStake: number
    totalStakePreviousDay: number
  }
}

export const AssetRow: React.FC<TAssetRowProps> = ({ assetData }) => {
  const { epochData } = useSocketContext()
  const [tokenAccuracyStake, setTokenAccuracyStake] = useState<
    TAssetRowState['tokenAccuracyStake']
  >({
    accuracy: 0,
    totalStake: 0,
    totalStakePreviousDay: 0
  })

  const { currentEpoch, secondsPerEpoch } = usePredictoorsContext()

  //const testLoadCountRef = useRef<number>(0)
  const { accuracyStatistics } = useAccuracyContext()

  const { timeFrameInterval } = useTimeFrameContext()

  const [tokenData, setTokenData] = useState<TokenData>({
    name: '',
    symbol: '',
    pair: '',
    price: 0,
    market: ''
  })
  const { allPairsData } = useMarketPriceContext()

  const {
    tokenName,
    pairName,
    subscription,
    subscriptionPrice,
    secondsPerSubscription,
    market,
    baseToken,
    quoteToken,
    //interval,
    contract
  } = assetData

  // Periodic price update
  useEffect(() => {
    const priceInterval = setInterval(() => {
      if (!allPairsData) return

      const pairSymbol = `${baseToken}${quoteToken}`
      const price = getSpecificPairFromContextData({
        allPairsData: allPairsData,
        pairSymbol: pairSymbol
      })

      const name = `${baseToken}-${quoteToken}`
      setTokenData({
        price: parseFloat(price),
        name,
        pair: pairSymbol,
        symbol: baseToken,
        market: market
      })
    }, 10000)

    return () => {
      clearInterval(priceInterval)
    }
  }, [allPairsData, baseToken, quoteToken, market, epochData])

  const slotProps = useMemo(
    () =>
      tokenName && pairName && subscription
        ? {
            tokenName,
            pairName,
            subscription,
            market
          }
        : null,
    [tokenName, pairName, subscription, market]
  )

  useEffect(() => {
    if (!allPairsData) return

    const pairSymbol = `${baseToken}${quoteToken}`
    const price = getSpecificPairFromContextData({
      allPairsData: allPairsData,
      pairSymbol: pairSymbol
    })

    const name = `${baseToken}-${quoteToken}`
    setTokenData({
      price: parseFloat(price),
      name,
      pair: pairSymbol,
      symbol: baseToken,
      market: market
    })
  }, [allPairsData, baseToken, quoteToken, market])

  useEffect(() => {
    if (!contract || !getAccuracyStatisticsByTokenName) return

    const data = getAccuracyStatisticsByTokenName({
      contractAddress: contract.address,
      accuracyData: accuracyStatistics,
      timeFrameInterval: timeFrameInterval
    })

    if (!data) return
    const { average_accuracy, total_staked_today, total_staked_yesterday } = data
    setTokenAccuracyStake({
      accuracy: average_accuracy,
      totalStake: total_staked_today,
      totalStakePreviousDay: total_staked_yesterday
    })
  }, [contract, timeFrameInterval, accuracyStatistics])

  if (!tokenData || !slotProps) return null

  return (
    <TableRowWrapper
      className="border-b border-border hover:bg-muted/50 transition-colors"
      cellProps={{
        className: "px-4 py-3 min-w-[150px]"
      }}
    >
      <Asset
        assetData={tokenData}
        contractAddress={contract.address}
        subscription={subscription}
        secondsPerSubscription={assetData.secondsPerSubscription}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.PastEpoch}
        price={tokenData.price}
        {...slotProps}
        subscription={subscription}
        address={contract.address}
        epochStartTs={currentEpoch - secondsPerEpoch}
        secondsPerEpoch={secondsPerEpoch}
      />
      <EpochDisplay
        status={EEpochDisplayStatus.LiveEpoch}
        price={tokenData.price}
        {...slotProps}
        epochStartTs={currentEpoch}
        address={contract.address}
        subscription={subscription}
        secondsPerEpoch={secondsPerEpoch}
      />
      <Price assetData={tokenData} />
      {subscription !== SubscriptionStatus.INACTIVE ? (
        <EpochDisplay
          status={EEpochDisplayStatus.NextEpoch}
          price={tokenData.price}
          {...slotProps}
          subscription={subscription}
          address={contract.address}
          epochStartTs={currentEpoch + secondsPerEpoch}
          secondsPerEpoch={secondsPerEpoch}
        />
      ) : (
        <Subscription
          subscriptionData={{
            price: parseInt(subscriptionPrice),
            status: subscription,
            secondsPerSubscription: secondsPerSubscription
          }}
          contractAddress={contract.address}
        />
      )}
      <Accuracy accuracy={tokenAccuracyStake.accuracy} />
      <Stake
        totalStake={tokenAccuracyStake.totalStake}
        totalStakePreviousDay={tokenAccuracyStake.totalStakePreviousDay}
      />
    </TableRowWrapper>
  )
}
