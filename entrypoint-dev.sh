#!/bin/ash

# Exit on error
set -e

# Wait for database container
echo "Waiting for database to be ready..."
/bin/sh -c 'until nc -z postgres 5432; do sleep 1; echo "Waiting for PostgreSQL..."; done'

# Check if migrations directory exists and has content
if [ -z "$(ls -A /app/prisma/migrations 2>/dev/null)" ]; then
  # First time setup - create initial migration
  echo "Creating initial migration..."
  npx prisma migrate dev --name initial
else
  # Regular startup - apply any pending migrations
  echo "Applying migrations..."
  npx prisma migrate dev
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate


# Run next application in dev mode
echo "Starting application in dev mode..."
pnpm run dev