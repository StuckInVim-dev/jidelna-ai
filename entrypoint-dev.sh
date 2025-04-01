#!/bin/ash

# Exit on error
set -e

# Wait for database container
sleep 5

# Run prisma migrations
npx prisma migrate dev

# Run next application in dev mode
pnpm run dev