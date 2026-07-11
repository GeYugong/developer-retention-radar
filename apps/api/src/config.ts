import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().default('postgres://radar:radar@localhost:5432/radar'),
  JWT_SECRET: z.string().min(16).default('change-me-in-production'),
  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().min(8).default('Radar@2026'),
  PUBLIC_URL: z.string().url().default('http://localhost:5173')
});
export const config = schema.parse(process.env);
