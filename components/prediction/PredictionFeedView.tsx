"use client"

import { TAssetData } from '../AssetTable'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { PreviousEpochCard } from './PreviousEpochCard'
import { LiveEpochCard } from './LiveEpochCard'
import { NextEpochCard } from './NextEpochCard'
import { FeedStats } from './FeedStats'
import { PredictionFeedHeader } from './PredictionFeedHeader'

export type PredictionFeedViewProps = {
  selectedPair: TAssetData
  allPairs: TAssetData[]
  onSelectPair: (pair: TAssetData) => void
}

export function PredictionFeedView({ selectedPair, allPairs, onSelectPair }: PredictionFeedViewProps) {
  const { currentEpoch, secondsPerEpoch } = usePredictoorsContext()

  const previousEpochStartTs = currentEpoch - secondsPerEpoch

  return (
    <div className="space-y-6">
      {/* Header with Combobox selector */}
      <PredictionFeedHeader
        assetData={selectedPair}
        allPairs={allPairs}
        onSelectPair={onSelectPair}
      />

      {/* Three epoch cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PreviousEpochCard
          assetData={selectedPair}
          epochStartTs={previousEpochStartTs}
          secondsPerEpoch={secondsPerEpoch}
        />
        <LiveEpochCard
          assetData={selectedPair}
          currentEpoch={currentEpoch}
          secondsPerEpoch={secondsPerEpoch}
        />
        <NextEpochCard
          assetData={selectedPair}
          currentEpoch={currentEpoch}
          secondsPerEpoch={secondsPerEpoch}
        />
      </div>

      {/* Stats and Buy section */}
      <FeedStats assetData={selectedPair} />
    </div>
  )
}
