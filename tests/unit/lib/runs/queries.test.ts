import { describe, expect, it, vi } from "vitest";
import { getRunShell, listRuns } from "@/lib/runs/queries";

describe("listRuns", () => {
  it("orders active runs ahead of newer ended runs", async () => {
    const queryBuilder = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
    };

    queryBuilder.select.mockReturnValue(queryBuilder);
    queryBuilder.eq.mockReturnValue(queryBuilder);
    queryBuilder.order.mockReturnValue(queryBuilder);
    queryBuilder.limit.mockResolvedValue({
      data: [{ id: "run-1", status: "active" }],
      error: null,
    });

    const supabase = {
      from: vi.fn().mockReturnValue(queryBuilder),
    } as never;

    const runs = await listRuns(supabase, "user-1", 1);

    expect(queryBuilder.order).toHaveBeenNthCalledWith(1, "status", {
      ascending: true,
    });
    expect(queryBuilder.order).toHaveBeenNthCalledWith(2, "updated_at", {
      ascending: false,
    });
    expect(queryBuilder.limit).toHaveBeenCalledWith(1);
    expect(runs).toEqual([{ id: "run-1", status: "active" }]);
  });
});

describe("getRunShell", () => {
  it("returns null without querying PostgREST when runId is not a UUID", async () => {
    const supabase = {
      from: vi.fn(),
    };

    await expect(
      getRunShell(supabase as never, "user-1", "not-a-uuid"),
    ).resolves.toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
