
import { neon } from 'https://esm.sh/@neondatabase/serverless@0.10.4';

const getDatabaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  return ''; 
};

const databaseUrl = getDatabaseUrl();
export const sql = databaseUrl ? neon(databaseUrl) : null;
