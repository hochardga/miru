import { Panel } from "@/components/ui/Panel";
import type { InventoryItem } from "@/lib/game/types";

type InventoryPanelProps = {
  items: InventoryItem[];
};

function formatCategory(category: InventoryItem["category"]) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function InventoryPanel({ items }: InventoryPanelProps) {
  return (
    <Panel className="grid gap-4">
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <h2 className="font-heading text-2xl">Inventory</h2>
        <span className="shrink-0 font-mono text-xs uppercase text-ink-muted">
          {items.length} items
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-ink-border px-3 py-4 text-sm text-ink-muted">
          Inventory empty.
        </p>
      ) : (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="grid min-w-0 gap-2 rounded-md border border-ink-border bg-field-surfaceMuted px-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold leading-6">
                  {item.name}
                </p>
                <p className="mt-1 font-mono text-xs uppercase text-ink-muted">
                  {formatCategory(item.category)}
                </p>
              </div>
              <span className="self-start justify-self-start rounded-sm border border-ink-border px-2 py-1 font-mono text-xs font-semibold sm:justify-self-end">
                x{item.quantity}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
