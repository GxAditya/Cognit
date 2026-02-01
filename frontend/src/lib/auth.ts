import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";

// Log environment variable status (remove in production)
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("BETTER_AUTH_SECRET exists:", !!process.env.BETTER_AUTH_SECRET);

// Skip validation during CLI commands (they don't load .env.local)
const isCli = process.argv.some(arg => arg.includes('better-auth') || arg.includes('generate') || arg.includes('migrate'));

if (!process.env.DATABASE_URL && !isCli) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a dummy pool for CLI if needed
const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({ connectionString: "postgresql://dummy:dummy@localhost:5432/dummy" });

// Test pool connection on startup
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

export const auth = betterAuth({
  database: {
    dialect: new PostgresDialect({ pool }),
    type: "postgres",
    autoMigrate: true, // Auto-create tables in development
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Auto sign in after registration
  },
  secret: process.env.BETTER_AUTH_SECRET || "dummy-secret-for-cli",
  baseURL: process.env.BETTER_AUTH_BASE_URL || "http://localhost:3000",
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Auth = typeof auth;