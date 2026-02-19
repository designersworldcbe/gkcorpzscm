
import { neon } from 'https://esm.sh/@neondatabase/serverless@0.10.4';

const getDatabaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  // In Netlify, this will be injected from the site settings
  return ''; 
};

const databaseUrl = getDatabaseUrl();

export const sql = databaseUrl ? neon(databaseUrl) : null;

if (!sql) {
  console.warn("Neon Database connection string (DATABASE_URL) is missing. Add it to Netlify environment variables.");
}
