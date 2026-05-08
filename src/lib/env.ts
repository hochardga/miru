import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

type RequiredPublicEnv = z.infer<typeof publicEnvSchema>;
type PublicEnv = RequiredPublicEnv & {
  NEXT_PUBLIC_APP_URL: string;
};
type PublicEnvInput =
  | Partial<
      Record<
        | keyof PublicEnv
        | "NEXT_PUBLIC_VERCEL_ENV"
        | "NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL"
        | "NEXT_PUBLIC_VERCEL_BRANCH_URL"
        | "NEXT_PUBLIC_VERCEL_URL",
        string | undefined
      >
    >
  | NodeJS.ProcessEnv;

function getDefaultPublicEnvInput(): PublicEnvInput {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    NEXT_PUBLIC_VERCEL_BRANCH_URL: process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
  };
}

function normalizeOrigin(value: string | undefined) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return null;
  }

  const urlValue = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    return new URL(urlValue).origin;
  } catch {
    return null;
  }
}

export function resolvePublicAppUrl(
  input: PublicEnvInput = getDefaultPublicEnvInput(),
) {
  const explicitAppUrl = normalizeOrigin(input.NEXT_PUBLIC_APP_URL);

  if (explicitAppUrl) {
    return explicitAppUrl;
  }

  if (input.NEXT_PUBLIC_VERCEL_ENV === "production") {
    const productionUrl = normalizeOrigin(
      input.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    );

    if (productionUrl) {
      return productionUrl;
    }
  }

  if (input.NEXT_PUBLIC_VERCEL_ENV === "preview") {
    const branchUrl = normalizeOrigin(input.NEXT_PUBLIC_VERCEL_BRANCH_URL);

    if (branchUrl) {
      return branchUrl;
    }
  }

  const deploymentUrl = normalizeOrigin(input.NEXT_PUBLIC_VERCEL_URL);

  if (deploymentUrl) {
    return deploymentUrl;
  }

  return "http://localhost:3000";
}

export function getPublicEnv(input: PublicEnvInput = getDefaultPublicEnvInput()) {
  const parsed = publicEnvSchema.safeParse(input);

  if (!parsed.success) {
    const missingKeys = parsed.error.issues.map((issue) => issue.path.join("."));
    throw new Error(
      `Missing or invalid public env: ${missingKeys.join(", ")}. Copy .env.example and provide hosted-dev values before using Supabase-backed flows.`,
    );
  }

  return {
    ...parsed.data,
    NEXT_PUBLIC_APP_URL: resolvePublicAppUrl(input),
  };
}
