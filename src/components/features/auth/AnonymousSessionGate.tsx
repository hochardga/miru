"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type ActionTarget = "start" | "rules" | "settings" | "runs" | "latestRun";
type RestoreState = "idle" | "loading" | "failed";

type RunsResponse = {
  ok: true;
  data: {
    runs: Array<{
      id: string;
      status: string;
    }>;
  };
};

type StartRunResponse = {
  ok: true;
  data: {
    runId: string;
  };
};

const AUTH_ERROR_MESSAGE =
  "Anonymous auth failed. Try again to prepare your table and save progress.";
const RESTORE_ERROR_MESSAGE =
  "Could not restore your latest run. Retry or open All Runs.";
const STALE_SESSION_MESSAGE =
  "Your previous guest session is no longer available in this browser. Start a new run or open All Runs.";

function getResumableLatestRunId(payload: RunsResponse) {
  const latestRun = payload.data.runs[0];

  if (!latestRun || latestRun.status !== "active") {
    return null;
  }

  return latestRun.id;
}

export function AnonymousSessionGate() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestRunId, setLatestRunId] = useState<string | null>(null);
  const [pendingLabel, setPendingLabel] = useState<ActionTarget | null>(null);
  const [restoreState, setRestoreState] = useState<RestoreState>("idle");
  const hasHydratedLatestRunRef = useRef(false);
  const supabaseRef = useRef<ReturnType<typeof createBrowserSupabaseClient> | null>(
    null,
  );

  const getSupabaseClient = useCallback(() => {
    if (supabaseRef.current) {
      return supabaseRef.current;
    }

    supabaseRef.current = createBrowserSupabaseClient();
    return supabaseRef.current;
  }, []);

  const hydrateLatestRun = useCallback(async () => {
    let supabase;

    try {
      supabase = getSupabaseClient();
    } catch {
      setLatestRunId(null);
      setRestoreState("idle");
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setLatestRunId(null);
      setRestoreState("idle");
      return;
    }

    setRestoreState("loading");

    try {
      const response = await fetch("/api/runs?limit=1");

      if (!response.ok) {
        throw new Error("latest-run-restore-failed");
      }

      const payload = (await response.json()) as RunsResponse;
      setLatestRunId(getResumableLatestRunId(payload));
      setRestoreState("idle");
    } catch {
      setLatestRunId(null);
      setRestoreState("failed");
    }
  }, [getSupabaseClient]);

  useEffect(() => {
    if (hasHydratedLatestRunRef.current) {
      return;
    }

    // Avoid duplicate latest-run hydration during development effect replays.
    hasHydratedLatestRunRef.current = true;
    void hydrateLatestRun();
  }, [hydrateLatestRun]);

  async function ensureSession(
    supabase: ReturnType<typeof createBrowserSupabaseClient>,
  ) {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      return data.session;
    }

    const signInResult = await supabase.auth.signInAnonymously();

    if (signInResult.error || !signInResult.data.session) {
      throw new Error(AUTH_ERROR_MESSAGE);
    }

    return signInResult.data.session;
  }

  async function handleProtectedAction(target: ActionTarget) {
    setErrorMessage(null);
    setPendingLabel(target);

    try {
      const supabase = getSupabaseClient();

      if (target === "latestRun") {
        if (!latestRunId) {
          return;
        }

        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          setLatestRunId(null);
          setErrorMessage(STALE_SESSION_MESSAGE);
          return;
        }

        router.push(`/play/${latestRunId}`);
        return;
      }

      await ensureSession(supabase);

      if (target === "start") {
        const response = await fetch("/api/runs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error("Run bootstrap failed. Try again.");
        }

        const payload = (await response.json()) as StartRunResponse;
        router.push(`/play/${payload.data.runId}`);
        return;
      }

      router.push(`/${target}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setPendingLabel(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={pendingLabel !== null}
          onClick={() => void handleProtectedAction("start")}
        >
          {pendingLabel === "start" ? "Preparing your table..." : "Start Run"}
        </Button>
        <Button
          variant="secondary"
          disabled={pendingLabel !== null}
          onClick={() => void handleProtectedAction("rules")}
        >
          Rules
        </Button>
        <Button
          variant="secondary"
          disabled={pendingLabel !== null}
          onClick={() => void handleProtectedAction("settings")}
        >
          Settings
        </Button>
        {latestRunId ? (
          <Button
            variant="secondary"
            disabled={pendingLabel !== null}
            onClick={() => void handleProtectedAction("latestRun")}
          >
            Continue Latest Run
          </Button>
        ) : null}
        <Button
          variant="secondary"
          disabled={pendingLabel !== null}
          onClick={() => void handleProtectedAction("runs")}
        >
          All Runs
        </Button>
      </div>

      {restoreState === "loading" ? (
        <p className="text-sm text-ink-muted">Restoring your latest run...</p>
      ) : null}

      {restoreState === "failed" ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-status-error">{RESTORE_ERROR_MESSAGE}</p>
          <Button
            variant="ghost"
            disabled={pendingLabel !== null}
            onClick={() => void hydrateLatestRun()}
          >
            Retry restore
          </Button>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-status-error">{errorMessage}</p>
      ) : null}
    </div>
  );
}
