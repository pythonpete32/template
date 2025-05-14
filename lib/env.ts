import { z } from "zod";

// Schema for client-side public variables (must be prefixed with NEXT_PUBLIC_)
const publicEnvSchema = z.object({
  NEXT_PUBLIC_ALCHEMY_ID: z.string(),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
});

// Schema for server-side private variables
const serverOnlyEnvSchema = z.object({
  RELAY_PK: z
    .string()
    .startsWith("0x", { message: "Private key must start with '0x'" })
    .transform((val): `0x${string}` => val as `0x${string}`),
  ALCHEMY_API_KEY: z.string(),
});

// Combined schema for full server-side validation
const fullServerEnvSchema = publicEnvSchema.merge(serverOnlyEnvSchema);

// Parsed public environment variables - safe to use on client and server
export const clientEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_ALCHEMY_ID: process.env.NEXT_PUBLIC_ALCHEMY_ID,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
});

// Function to get all parsed server environment variables.
export const getServerEnv = () => {
  if (typeof window !== 'undefined') {
    console.warn("Attempted to access serverEnv on the client. This is generally not allowed or indicates a logic error. Ensure this function is only called server-side.");
    // To prevent hard crashes on accidental client-side import if not caught by tree-shaking or if used improperly,
    // return a structure that matches serverEnv but with public parts potentially filled if accessible,
    // and private parts explicitly undefined or throwing an error on access.
    // However, the primary defense is to not call this from client code.
    // Throwing an error here is safer to catch mistakes during development.
    throw new Error("getServerEnv() was called on the client.");
  }
  return fullServerEnvSchema.parse(process.env);
};

// Initial server-side log to confirm .env loading (runs at server start/build)
if (typeof window === 'undefined') {
  try {
    console.log("Server-side: Validating all environment variables at init...");
    const serverValidation = getServerEnv(); // Validates all server vars
    console.log("Server-side: Full environment variables validated and loaded successfully.");
  } catch (e) {
    console.error("FATAL: Server environment variable validation failed at init!", e instanceof Error ? e.message : e);
    // Consider exiting if server env validation is critical for startup
    // process.exit(1); 
  }
}

// Client-side log (runs in browser console and server console during SSR/build of client components)
console.log("Environment setup: clientEnv loaded:", clientEnv);
