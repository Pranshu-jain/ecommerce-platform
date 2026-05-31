import { neon } from '@neondatabase/serverless';

// Called inside request handlers so DATABASE_URL is resolved at runtime, not build time
export function getDb() {
  return neon(process.env.DATABASE_URL!);
}
