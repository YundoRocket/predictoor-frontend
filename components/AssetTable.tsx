'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { tooltipsText } from '../metadata/tootltips'

import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useTimeFrameContext } from '@/contexts/TimeFrameContext'
import LiveTime from './elements/LiveTime'
import { TableRowWrapper } from './elements/TableRowWrapper'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import {
  assetTableColumns,
  currentConfig,
  formatTime
} from '@/utils/appconstants'
import { splitContractName } from '@/utils/splitContractName'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { EPredictoorContractInterval } from '@/utils/types/EPredictoorContractInterval'
import { AssetRow } from './AssetRow'
import { SubscriptionStatus } from './Subscription'

type TableColumn = {
  Header: string | React.ReactNode
  accessor: string
}

export type TAssetData = {
  tokenName: string
  pairName: string
  market: string
  baseToken: string
  quoteToken: string
  interval: string
  contract: TPredictionContract
  subscription: SubscriptionStatus
  subscriptionPrice: string
  secondsPerSubscription: number
}

export type TAssetTableProps = {
  contracts: Record<string, TPredictionContract> | undefined
}

export type TAssetTableState = {
  AssetsData: Array<TAssetData>
}

export const AssetTable: React.FC<TAssetTableProps> = ({ contracts }) => {
  const { subscribedPredictoors, currentEpoch, secondsPerEpoch } =
    usePredictoorsContext()

  const { fetchAndCacheAllPairs } = useMarketPriceContext()

  const [tableColumns, setTableColumns] = useState<TableColumn[]>(assetTableColumns)
  const [assetsData, setAssetsData] = useState<TAssetTableState['AssetsData']>()
  const { timeFrameInterval } = useTimeFrameContext()
  const subscribedContractAddresses = useMemo(
    () => subscribedPredictoors.map((contract) => contract.address),
    [subscribedPredictoors]
  )

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

  const prepareAssetData = useCallback<
    (contracts: Record<string, TPredictionContract>) => void
  >(
    (contracts) => {
      const assetsData: TAssetTableState['AssetsData'] = []

      // Iterate over each contract
      Object.entries(contracts).forEach(([, contract]) => {
        // Split contract name into token name and pair name
        const [tokenName, pairName] = splitContractName(contract.name)

        // Get subscription status
        const subscriptionStatus = getSubscriptionStatus(contract)

        // Create an object with the required data and push it to the assetsData array
        assetsData.push({
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

      assetsData.sort((a, b) => {
        if (a.subscription === SubscriptionStatus.FREE) return -1
        if (b.subscription === SubscriptionStatus.FREE) return 1
        if (a.subscription === SubscriptionStatus.ACTIVE) return -1
        if (b.subscription === SubscriptionStatus.ACTIVE) return 1
        for (const token of privilegedTokens) {
          if (a.tokenName === token) return -1
          if (b.tokenName === token) return 1
        }
        return a.tokenName.toUpperCase().charCodeAt(0)
      })

      // Update the state with the assetsData array
      setAssetsData(assetsData)
    },
    [getSubscriptionStatus]
  )

  const getThowLinesHeader = (
    firstLineText: string,
    secondLineText: string
  ) => {
    return (
      <div className="flex flex-col">
        {firstLineText}
        <span className="text-xs text-muted-foreground">{secondLineText}</span>
      </div>
    )
  }

  useEffect(() => {
    if (!contracts || !prepareAssetData) return
    prepareAssetData(contracts)
  }, [contracts, prepareAssetData])

  useEffect(() => {
    if (!currentEpoch) return
    const newAssetTableColumns: TableColumn[] = JSON.parse(JSON.stringify(assetTableColumns))
    newAssetTableColumns[1].Header = formatTime(
      new Date((currentEpoch - secondsPerEpoch) * 1000)
    )
    newAssetTableColumns[2].Header = formatTime(new Date(currentEpoch * 1000))
    newAssetTableColumns[3].Header = <LiveTime />
    newAssetTableColumns[4].Header = getThowLinesHeader(
      formatTime(new Date((currentEpoch + secondsPerEpoch) * 1000)),
      'Predictions'
    )
    newAssetTableColumns[5].Header = getThowLinesHeader(
      newAssetTableColumns[5].Header as string,
      timeFrameInterval === EPredictoorContractInterval.e_5M
        ? '1 week'
        : '4 weeks'
    )
    newAssetTableColumns[6].Header = getThowLinesHeader(
      newAssetTableColumns[6].Header as string,
      '24h'
    )

    setTableColumns(newAssetTableColumns)
  }, [currentEpoch, timeFrameInterval])

  useEffect(() => {
    fetchAndCacheAllPairs()
    const interval = setInterval(() => {
      fetchAndCacheAllPairs()
    }, 1000)
    return () => clearInterval(interval)
  }, [fetchAndCacheAllPairs])

  return (
    tableColumns && (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <TableRowWrapper
              className="border-b border-border"
              cellProps={{
                className: "px-4 py-3 text-left text-sm font-medium min-w-[150px]"
              }}
              cellType="th"
            >
              {tableColumns.map((item) => {
                const getTooltipText = () => {
                  if (item.accessor !== 'accuracy')
                    return tooltipsText[
                      item.accessor as keyof typeof tooltipsText
                    ]

                  const tempKey =
                    timeFrameInterval === EPredictoorContractInterval.e_5M
                      ? 'accuracy_5m'
                      : 'accuracy_1h'
                  return tooltipsText[tempKey]
                }

                return (
                  <div
                    className="flex items-center gap-1"
                    key={`assetHeader${item.accessor}`}
                    id={item.accessor}
                  >
                    <span>{item.Header}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="inline-flex items-center justify-center ml-1">
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{getTooltipText()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )
              })}
            </TableRowWrapper>
          </thead>
          {assetsData ? (
            assetsData.length > 0 ? (
              <tbody>
                {assetsData.map((item) => (
                  <AssetRow
                    key={`assetRow${item.contract.address}`}
                    assetData={item}
                  />
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>No contracts found</td>
                </tr>
              </tbody>
            )
          ) : (
            <tbody>
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>Loading</td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    )
  )
}
