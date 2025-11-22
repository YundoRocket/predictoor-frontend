"use client"

import { useState, useEffect } from 'react'

export type EpochCountdownProps = {
  currentEpochTimeStamp: number
  secondsPerEpoch: number
}

export default function EpochCountdown({
  currentEpochTimeStamp,
  secondsPerEpoch
}: EpochCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000)
      const epochEndTime = currentEpochTimeStamp + secondsPerEpoch
      const remaining = Math.max(0, epochEndTime - now)
      setTimeRemaining(remaining)
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [currentEpochTimeStamp, secondsPerEpoch])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <span className="font-mono text-sm">
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  )
}
