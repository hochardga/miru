import { Panel } from "@/components/ui/Panel";
import { StatBadge } from "@/components/ui/StatBadge";
import type { RunStats } from "@/lib/game/types";

type CharacterPanelProps = {
  stats: RunStats;
};

export function CharacterPanel({ stats }: CharacterPanelProps) {
  return (
    <Panel className="grid gap-4">
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <h2 className="font-heading text-2xl">Character</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBadge label="HP" value={stats.hp} />
        <StatBadge label="EP" value={stats.ep} />
        <StatBadge label="ATK" value={stats.baseAtk} />
        <StatBadge label="DEF" value={stats.baseDef} />
        <StatBadge label="Bitliths" value={stats.bitliths} />
        <StatBadge label="Starvation" value={stats.starvationCount} />
        <StatBadge label="Sleep" value={stats.sleepDeprivationCount} />
        <StatBadge label="Injury" value={stats.minorInjuryCount} />
      </div>
    </Panel>
  );
}
