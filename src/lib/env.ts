import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

type PublicEnv = z.infer<typeof publicEnvSchema>;
type PublicEnvInput =
  | Partial<Record<keyof PublicEnv, string | undefined>>
  | NodeJS.ProcessEnv;

function getDefaultPublicEnvInput(): PublicEnvInput {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };
}

export function getPublicEnv(input: PublicEnvInput = getDefaultPublicEnvInput()) {
  const parsed = publicEnvSchema.safeParse(input);

  if (!parsed.success) {
    const missingKeys = parsed.error.issues.map((issue) => issue.path.join("."));
    throw new Error(
      `Missing or invalid public env: ${missingKeys.join(", ")}. Copy .env.example and provide hosted-dev values before using Supabase-backed flows.`,
    );
  }

  return parsed.data;
}
