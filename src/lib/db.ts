import { Pool } from 'pg';

/**
 * PostgreSQL connection pool using environment variable DATABASE_URL.
 * Configured to allow SSL connections with self-signed certificates.
 * Exports a reusable pool instance for database queries.
 */

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Allow self-signed certificates
    },
});

export default pool;
