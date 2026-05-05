import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { defineConfig } from "@playwright/test";

const localSmokeBaseUrl = "http://localhost:3100";
const localSmokeReadyUrl = "http://localhost:3102/ready";

const localSmokeBrowserEnv = {
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "test-anon-key",
  NEXT_PUBLIC_APP_URL: localSmokeBaseUrl,
};

const localSmokeChildEnv = {
  ...localSmokeBrowserEnv,
  E2E_DISABLE_REMOTE_AUTH: "true",
};

const localSmokeBootstrap = `
const { spawn } = require("node:child_process");
const { createServer } = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const baseUrl = ${JSON.stringify(localSmokeBaseUrl)};
const childEnv = { ...process.env, ...${JSON.stringify(localSmokeChildEnv)} };
const browserEnvLiteral = ${JSON.stringify(
  JSON.stringify(localSmokeBrowserEnv),
)};
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

let ready = false;

const readyServer = createServer((request, response) => {
  response.statusCode = ready ? 200 : 503;
  response.end(ready ? "ok" : "starting");
});

readyServer.listen(3102, "localhost");

const child = spawn(
  npmCommand,
  ["run", "dev", "--", "--hostname", "localhost", "--port", "3100"],
  {
    env: childEnv,
    stdio: "inherit",
  },
);

function stopWith(code) {
  readyServer.close(() => process.exit(code));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {}

    await delay(500);
  }

  throw new Error("Timed out waiting for " + url);
}

async function patchClientEnvChunk() {
  const chunksDir = path.join(process.cwd(), ".next", "dev", "static", "chunks");
  const defaultArgPattern = /function getPublicEnv\\(input = [^)]*\\) \\{/;

  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      await fetch(baseUrl);
    } catch {}

    if (!fs.existsSync(chunksDir)) {
      await delay(250);
      continue;
    }

    let patched = false;

    for (const entry of fs.readdirSync(chunksDir)) {
      if (!entry.endsWith(".js")) {
        continue;
      }

      const filePath = path.join(chunksDir, entry);
      const source = fs.readFileSync(filePath, "utf8");
      const patchedSignature =
        "function getPublicEnv(input = " + browserEnvLiteral + ") {";

      if (
        !source.includes("function getPublicEnv(input =") ||
        !source.includes("Missing or invalid public env")
      ) {
        continue;
      }

      if (source.includes(patchedSignature)) {
        patched = true;
        continue;
      }

      const updated = source.replace(
        defaultArgPattern,
        patchedSignature,
      );

      if (updated !== source) {
        fs.writeFileSync(filePath, updated);
        patched = true;
      }
    }

    if (patched) {
      return;
    }

    await delay(250);
  }

  throw new Error("Could not patch the generated client env chunk.");
}

async function bootstrap() {
  await waitForServer(baseUrl);
  await patchClientEnvChunk();
  ready = true;
}

bootstrap().catch((error) => {
  console.error(error);
  child.kill("SIGTERM");
  stopWith(1);
});

child.on("exit", (code) => stopWith(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
`;

const localSmokeBootstrapPath = join(
  tmpdir(),
  "miru-playwright-local-smoke.cjs",
);

const shouldManageLocalSmokeServer = !process.env.PLAYWRIGHT_BASE_URL;

if (shouldManageLocalSmokeServer) {
  writeFileSync(localSmokeBootstrapPath, localSmokeBootstrap);
}

const localSmokeCommand = `${JSON.stringify(process.execPath)} ${JSON.stringify(localSmokeBootstrapPath)}`;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? localSmokeBaseUrl,
    trace: "on-first-retry",
  },
  webServer: shouldManageLocalSmokeServer
    ? {
        command: localSmokeCommand,
        url: localSmokeReadyUrl,
        reuseExistingServer: false,
      }
    : undefined,
});
