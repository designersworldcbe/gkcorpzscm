
import { neon } from 'https://esm.sh/@neondatabase/serverless@0.10.4';

// Use the provided Neon connection string directly for browser-side execution
const DATABASE_URL = 'postgresql://neondb_owner:npg_LWItg91wZTfC@ep-falling-breeze-aesfhxt5-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Export the sql function. In browser apps, we use the constant directly.
export const sql = neon(DATABASE_URL);

console.log("Neon Database initialized via Direct Link.");
