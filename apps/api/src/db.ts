import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({ connectionString: config.DATABASE_URL });
export async function query<T extends pg.QueryResultRow>(text: string, params: unknown[] = []) {
  return pool.query<T>(text, params);
}
