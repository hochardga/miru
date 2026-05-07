"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { ActionBar } from "@/components/features/play/ActionBar";
import { CurrentPrompt } from "@/components/features/play/CurrentPrompt";
import { DiceResult } from "@/components/ui/DiceResult";
import { Panel } from "@/components/ui/Panel";
import type {
  ActionSummary,
  DiceRoll,
  JournalEntry,
  LegalAction,
  RunSnapshot,
} from "@/lib/game/types";

type PlayTableProps = {
  initialSnapshot: RunSnapshot;
};

type ActionResponse = {
  ok: boolean;
  data?: {
    snapshot: RunSnapshot;
    summary?: Omit<ActionSummary, "id" | "createdAt">;
    diceRolls?: DiceRoll[];
  };
  error?: {
    message?: string;
  };
};

type JournalResponse = {
  ok: boolean;
  data?: JournalEntry;
  error?: {
    message?: string;
  };
};

const FALLBACK_ERROR = "The table could not save that move.";

function dayCompleteSnapshot(
  snapshot: RunSnapshot,
  journalEntry: JournalEntry,
): RunSnapshot {
  return {
    ...snapshot,
    pendingPrompt: {
      type: "day_complete",
      title: "Journal saved",
      body: "Day complete.",
    },
    legalActions: [{ type: "next_day", label: "Next Day" }],
    latestJournalEntry: journalEntry,
  };
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function apiErrorMessage(body: ActionResponse | JournalResponse | null) {
  return body?.error?.message ?? FALLBACK_ERROR;
}

export function PlayTable({ initialSnapshot }: PlayTableProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [journalBody, setJournalBody] = useState("");
  const [lastAction, setLastAction] =
    useState<Omit<ActionSummary, "id" | "createdAt"> | null>(null);
  const [lastDiceRolls, setLastDiceRolls] = useState<DiceRoll[]>([]);

  async function submitAction(action: LegalAction) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/runs/${snapshot.run.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: action.type,
          payload: action.payload,
        }),
      });
      const body = await parseJsonResponse<ActionResponse>(response);

      if (!response.ok || !body?.ok || !body.data?.snapshot) {
        setError(apiErrorMessage(body));
        return;
      }

      setSnapshot(body.data.snapshot);
      setLastAction(body.data.summary ?? null);
      setLastDiceRolls(body.data.diceRolls ?? body.data.summary?.diceRolls ?? []);
    } catch {
      setError(FALLBACK_ERROR);
    } finally {
      setSaving(false);
    }
  }

  async function submitJournal() {
    if (snapshot.pendingPrompt.type !== "journal_available") {
      return;
    }

    const trimmedBody = journalBody.trim();

    if (!trimmedBody) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/runs/${snapshot.run.id}/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayNumber: snapshot.pendingPrompt.dayNumber,
          tileId: snapshot.pendingPrompt.tileId,
          body: trimmedBody,
        }),
      });
      const body = await parseJsonResponse<JournalResponse>(response);

      if (!response.ok || !body?.ok || !body.data) {
        setError(apiErrorMessage(body));
        return;
      }

      const journalEntry = body.data;

      setSnapshot((current) => dayCompleteSnapshot(current, journalEntry));
      setJournalBody("");
      setLastAction(null);
      setLastDiceRolls([]);
    } catch {
      setError(FALLBACK_ERROR);
    } finally {
      setSaving(false);
    }
  }

  const recentAction = lastAction ?? snapshot.recentActions[0] ?? null;
  const recentDiceRolls =
    lastDiceRolls.length > 0 ? lastDiceRolls : (recentAction?.diceRolls ?? []);

  return (
    <div className="grid gap-4">
      <Panel className="grid gap-4">
        <CurrentPrompt
          prompt={snapshot.pendingPrompt}
          latestJournalBody={snapshot.latestJournalEntry?.body}
        />
        <ActionBar
          disabled={saving}
          journalBody={journalBody}
          legalActions={snapshot.legalActions}
          onAction={submitAction}
          onJournalBodyChange={setJournalBody}
          onJournalSubmit={submitJournal}
          prompt={snapshot.pendingPrompt}
        />
        {error ? (
          <div
            className="flex items-start gap-2 rounded-md border border-red-700/30 bg-red-50 px-3 py-2 text-sm text-red-900"
            role="alert"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
      </Panel>

      <Panel className="grid gap-3 sm:grid-cols-4">
        <StatusValue label="Tile" value={snapshot.currentTile.coordinate} />
        <StatusValue label="Day" value={`Day ${snapshot.run.currentDay}`} />
        <StatusValue label="HP" value={String(snapshot.stats.hp)} />
        <StatusValue label="EP" value={String(snapshot.stats.ep)} />
      </Panel>

      {recentAction || recentDiceRolls.length > 0 ? (
        <Panel className="grid gap-3">
          {recentAction ? (
            <div className="grid gap-1">
              <p className="font-mono text-xs uppercase text-ink-muted">
                Recent Action
              </p>
              <h3 className="font-heading text-xl">{recentAction.title}</h3>
              {recentAction.body ? (
                <p className="text-sm leading-6 text-ink-muted">
                  {recentAction.body}
                </p>
              ) : null}
            </div>
          ) : null}
          <DiceResult rolls={recentDiceRolls} />
        </Panel>
      ) : null}
    </div>
  );
}

function StatusValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-16 border-l border-ink-border px-3 py-2">
      <p className="font-mono text-xs uppercase text-ink-muted">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold">{value}</p>
    </div>
  );
}
