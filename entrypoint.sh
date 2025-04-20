#!/bin/ash

# Exit on error
set -e

# Handle shutdown signals properly
trap 'echo "Shutdown signal received, exiting gracefully..."; exit 0' SIGTERM SIGINT

# Wait for database to be ready with timeout
echo "Waiting for database to be ready..."
MAX_RETRIES=30
count=0
until nc -z postgres 5432 || [ $count -eq $MAX_RETRIES ]
do
  echo "Waiting for PostgreSQL... ($((count+1))/$MAX_RETRIES)"
  sleep 2
  count=$((count+1))
done

if [ $count -eq $MAX_RETRIES ]; then
  echo "Error: Failed to connect to PostgreSQL after $MAX_RETRIES attempts."
  exit 1
fi

# Log database connection success
echo "Successfully connected to PostgreSQL"

# Run prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client if needed
echo "Generating Prisma client..."
npx prisma generate

# Run next application
echo "Starting application in production mode..."
exec pnpm run start