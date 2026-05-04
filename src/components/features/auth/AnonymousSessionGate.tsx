"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type ActionTarget = "start" | "rules" | "settings" | "runs";

type RunsResponse = {
  ok: true;
  data: {
    runs: Array<{
      id: string;
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

export function AnonymousSessionGate() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestRunId, setLatestRunId] = useState<string | null>(null);
  const [pendingLabel, setPendingLabel] = useState<ActionTarget | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function hydrateLatestRun() {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          return;
        }

        const response = await fetch("/api/runs?limit=1");

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as RunsResponse;

        if (isMounted) {
          setLatestRunId(payload.data.runs[0]?.id ?? null);
        }
      } catch {
        // Quietly fall back to the default action label if restoration fails.
      }
    }

    void hydrateLatestRun();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  async function ensureSession() {
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
      await ensureSession();

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
        <Button
          variant="secondary"
          disabled={pendingLabel !== null}
          onClick={() => {
            if (latestRunId) {
              setErrorMessage(null);
              router.push(`/play/${latestRunId}`);
              return;
            }

            void handleProtectedAction("runs");
          }}
        >
          {latestRunId ? "Continue Latest Run" : "All Runs"}
        </Button>
      </div>

      {errorMessage ? (
        <p className="text-sm text-status-error">{errorMessage}</p>
      ) : null}
    </div>
  );
}
