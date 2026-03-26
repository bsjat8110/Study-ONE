import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly for build environments
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // For CLI commands (db pull, migrate dev), Direct URL is preferred over Pooled URL
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://localhost:5432/postgres',
  },
});
