import { createClient, Client } from '@libsql/client/http';

const rawUrl = process.env.TURSO_DATABASE_URL || 'libsql://habbit-traccker-badtobiop.aws-ap-south-1.turso.io';
const httpsUrl = rawUrl.replace(/^libsql:\/\//, 'https://');
const authToken =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODc4MzcxMjcsImlkIjoiMDFhMDQzNjUtNmMwMS03NWIyLTk3YWMtN2RmYWE3NTVmOTQ0Iiwia2lkIjoiNFBpRTR0Q0lPTUMySE9zLW9DV0IxYUxxd2tYU0cyWWZ1VVA5NU9mN3NtQSIsInJpZCI6ImIyMzI3ZWM3LWQ2YjEtNDc4OC05MjgwLTFhZTQ0OGI0N2FjMCJ9.Kusodf4fscVgS3t8bGSgvkx-peLW_007VPa9P0qRsV8TGlhpU2ix0UD3wVaexUpmtt254B2d4hyJfcd8gxnCAw';

export const turso: Client = createClient({
  url: httpsUrl,
  authToken: authToken,
});

export async function queryOne<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  const res = await turso.execute({ sql, args });
  return (res.rows[0] as unknown as T) || null;
}

export async function queryAll<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const res = await turso.execute({ sql, args });
  return res.rows as unknown as T[];
}

export async function executeSql(
  sql: string,
  args: any[] = []
): Promise<{ rowsAffected: number; lastInsertRowid?: bigint }> {
  const res = await turso.execute({ sql, args });
  return { rowsAffected: res.rowsAffected, lastInsertRowid: res.lastInsertRowid };
}
