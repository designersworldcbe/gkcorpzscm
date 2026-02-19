
import { neon } from 'https://esm.sh/@neondatabase/serverless@0.10.4';

/**
 * The primary environment variable to add in Netlify is: DATABASE_URL
 * Use your Neon connection string as the value.
 */
const FALLBACK_URL = 'postgresql://neondb_owner:npg_LWItg91wZTfC@ep-falling-breeze-aesfhxt5-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const databaseUrl = (typeof process !== 'undefined' && process.env.DATABASE_URL) 
  ? process.env.DATABASE_URL 
  : FALLBACK_URL;

// Export the sql function.
export const sql = neon(databaseUrl);

console.log("Neon Database initialized. Connecting to:", databaseUrl.split('@')[1] || 'local');
