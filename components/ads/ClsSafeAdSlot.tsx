import AdSenseUnit from "@/app/components/AdSenseUnit";
import { getAdSenseSlots } from "@/app/utils/adsense";

export type CityAdPlacement = "above" | "below";

const PLACEMENT_CONFIG: Record<
  CityAdPlacement,
  { slotKey: "leaderboard" | "infeed"; label: string; minHeight: number }
> = {
  above: {
    slotKey: "leaderboard",
    label: "Advertisement",
    minHeight: 100,
  },
  below: {
    slotKey: "infeed",
    label: "Advertisement",
    minHeight: 100,
  },
};

export interface ClsSafeAdSlotProps {
  placement: CityAdPlacement;
  className?: string;
}

/**
 * Fixed-height ad rail — reserves space whether AdSense is configured or not
 * to prevent cumulative layout shift on programmatic city pages.
 */
export default function ClsSafeAdSlot({
  placement,
  className = "",
}: ClsSafeAdSlotProps) {
  const config = PLACEMENT_CONFIG[placement];
  const slots = getAdSenseSlots();
  const slot = slots[config.slotKey];

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      style={{ minHeight: config.minHeight }}
      data-ad-placement={placement}
    >
      <AdSenseUnit
        slot={slot}
        format="auto"
        fullWidthResponsive
        theme="light"
        placeholderLabel={config.label}
        className="min-h-[100px] w-full"
      />
    </div>
  );
}
