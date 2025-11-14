import { TimeFrameSwitch } from "@/components/TimeFrameSwitch";
import { AssetsContainer } from "@/components/AssetsContainer"

export default function Home() {
  return (
    <main className="w-full">
      <div className="mb-6 flex gap-4 items-start justify-between md:flex-row md:items-center ">
        <p className={'font-bold'}>
          Accurate price predictions for your favorite crypto assets
        </p>
        <TimeFrameSwitch />
      </div>
      <AssetsContainer />
    </main>
  );
}
