import { z } from "zod";

// Schema for client-side public variables (must be prefixed with NEXT_PUBLIC_)
const publicEnvSchema = z.object({
	NEXT_PUBLIC_ALCHEMY_ID: z.string(),
	NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
});
export type ClientEnv = z.infer<typeof publicEnvSchema>;

// Schema for server-side private variables
const serverOnlyEnvSchema = z.object({
	RELAY_PK: z.string().transform((val): `0x${string}` => val as `0x${string}`),
	SENDER_PK: z.string().transform((val): `0x${string}` => val as `0x${string}`),
	ALCHEMY_API_KEY: z.string(),
	ENSO_API_KEY: z.string(),
});
export type ServerEnv = z.infer<typeof serverOnlyEnvSchema>;

// Combined schema for full server-side validation
const fullServerEnvSchema = publicEnvSchema.merge(serverOnlyEnvSchema);

// Parsed public environment variables - safe to use on client and server
export const clientEnv = publicEnvSchema.parse({
	NEXT_PUBLIC_ALCHEMY_ID: process.env.NEXT_PUBLIC_ALCHEMY_ID,
	NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
		process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
});

// Function to get all parsed server environment variables.
export const getServerEnv = () => {
	if (typeof window !== "undefined") {
		throw new Error("getServerEnv() was called on the client.");
	}
	return fullServerEnvSchema.parse(process.env);
};

// Initial server-side log to confirm .env loading (runs at server start/build)
if (typeof window === "undefined") {
	try {
		console.log("Server-side: Validating all environment variables at init...");
		getServerEnv(); // Validates all server vars
		console.log(
			"Server-side: Full environment variables validated and loaded successfully.",
		);
	} catch (e) {
		console.error(
			"FATAL: Server environment variable validation failed at init!",
			e instanceof Error ? e.message : e,
		);
		process.exit(1);
	}
}
