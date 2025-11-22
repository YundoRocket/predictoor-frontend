"use client"

import { useState, useCallback, useMemo, useEffect } from 'react'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { splitContractName } from '@/utils/splitContractName'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { SubscriptionStatus } from '../Subscription'
import { PredictionFeedView } from './PredictionFeedView'
import { currentConfig } from '@/utils/appconstants'
import { SearchFilters } from '../SearchBar'
import { TAssetData } from '../AssetTable'

export type SinglePairViewProps = {
  contracts: Record<string, TPredictionContract> | undefined
  filters: SearchFilters
}

export function SinglePairView({ contracts, filters }: SinglePairViewProps) {
  const { subscribedPredictoors } = usePredictoorsContext()
  const { fetchAndCacheAllPairs } = useMarketPriceContext()

  const subscribedContractAddresses = useMemo(
    () => subscribedPredictoors.map((contract) => contract.address),
    [subscribedPredictoors]
  )

  // Fetch prices every second like in AssetTable
  useEffect(() => {
    fetchAndCacheAllPairs()
    const interval = setInterval(() => {
      fetchAndCacheAllPairs()
    }, 1000)
    return () => clearInterval(interval)
  }, [fetchAndCacheAllPairs])

  const getSubscriptionStatus = useCallback<
    (contract: TPredictionContract) => SubscriptionStatus
  >(
    (contract) => {
      if (subscribedContractAddresses.includes(contract.address)) {
        return SubscriptionStatus.ACTIVE
      }
      if (currentConfig.opfProvidedPredictions.includes(contract.address)) {
        return SubscriptionStatus.FREE
      }
      return SubscriptionStatus.INACTIVE
    },
    [subscribedContractAddresses]
  )

  const assetsData = useMemo<TAssetData[] | undefined>(() => {
    if (!contracts) return undefined

    const assets: TAssetData[] = []

    Object.entries(contracts).forEach(([, contract]) => {
      const [tokenName, pairName] = splitContractName(contract.name)

      const subscriptionStatus = getSubscriptionStatus(contract)

      assets.push({
        tokenName,
        pairName,
        contract,
        market: contract.market,
        baseToken: contract.baseToken,
        quoteToken: contract.quoteToken,
        subscriptionPrice: contract.price,
        interval: contract.interval,
        secondsPerSubscription: parseInt(contract.secondsPerSubscription),
        subscription: subscriptionStatus
      })
    })

    const privilegedTokens = ['BTC', 'ETH']

    // Sort: FREE → ACTIVE → BTC/ETH → alphabetical
    assets.sort((a, b) => {
      if (a.subscription === SubscriptionStatus.FREE) return -1
      if (b.subscription === SubscriptionStatus.FREE) return 1
      if (a.subscription === SubscriptionStatus.ACTIVE) return -1
      if (b.subscription === SubscriptionStatus.ACTIVE) return 1
      for (const token of privilegedTokens) {
        if (a.tokenName === token) return -1
        if (b.tokenName === token) return 1
      }
      return (
        a.tokenName.toUpperCase().charCodeAt(0) -
        b.tokenName.toUpperCase().charCodeAt(0)
      )
    })

    // Apply search filters
    let filteredAssets = assets

    if (filters.ticker) {
      const searchTerm = filters.ticker.toLowerCase()
      filteredAssets = filteredAssets.filter(
        (asset) =>
          asset.baseToken.toLowerCase().includes(searchTerm) ||
          asset.quoteToken.toLowerCase().includes(searchTerm) ||
          asset.tokenName.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.platform && filters.platform !== 'all') {
      filteredAssets = filteredAssets.filter(
        (asset) => asset.market.toLowerCase() === filters.platform.toLowerCase()
      )
    }

    return filteredAssets
  }, [contracts, getSubscriptionStatus, filters])

  // Select first pair by default (BTC if available)
  const [selectedPairState, setSelectedPairState] = useState<TAssetData | null>(null)

  // Calculate default pair (BTC-USDT or first available)
  const defaultPair = useMemo(() => {
    if (!assetsData || assetsData.length === 0) return null
    const btcPair = assetsData.find(
      (asset) => asset.baseToken === 'BTC' && asset.quoteToken === 'USDT'
    )
    return btcPair || assetsData[0]
  }, [assetsData])

  // Use selected pair or fallback to default
  const selectedPair = selectedPairState || defaultPair

  if (!assetsData || assetsData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-muted-foreground">
            {assetsData?.length === 0
              ? 'No prediction feeds found matching your filters.'
              : 'Loading prediction feeds...'}
          </div>
        </div>
      </div>
    )
  }

  if (!selectedPair) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main feed view with integrated selector in header */}
      <PredictionFeedView
        selectedPair={selectedPair}
        allPairs={assetsData}
        onSelectPair={setSelectedPairState}
      />
    </div>
  )
}
