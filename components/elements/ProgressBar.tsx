"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

type ProgressBarProps = {
  progress: number;
  max: number;
  refreshOnData?: unknown;
};

export default function ProgressBar({
  progress,
  max,
  refreshOnData,
}: ProgressBarProps) {
  const [completed, setCompleted] = useState(progress);

  useEffect(() => {
    setCompleted(progress);
  }, [progress, refreshOnData]);

  useEffect(() => {
    if (completed <= 0) return;

    const intervalId = setInterval(() => {
      setCompleted((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [completed]);

  const percentage =
    max > 0 ? Math.min(100, Math.max(0, (completed / max) * 100)) : 0;

  return (
    <Progress
      value={percentage}
      className="h-[3px] w-full"
    />
  );
}
