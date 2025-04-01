FROM node:22-alpine3.20 AS build

WORKDIR /app

# Install PNPM usin NPM
RUN npm install -g pnpm

# Create a limited user (to avoid using root)
RUN addgroup -S build_group && \
    adduser -S build -G build_group && \
    chown build:build_group /app

# Switch to the limited user
USER build

# Copy files with project dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies using PNPM
RUN pnpm install --frozen-lockfile

# Copy the rest of the codebase
COPY --chown=build:build_group . .

# Build the static assets for hosting
RUN pnpm run build

FROM node:22-alpine3.20 AS deploy

WORKDIR /app
RUN npm install -g pnpm

# Copy only necessary files from build stage
COPY --from=build /app/package.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public

# Copy entrypoint script
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 3000

# Start the application
CMD ["ash", "/app/entrypoint.sh"]