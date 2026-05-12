FROM oven/bun:1-alpine AS base
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json bun.lockb* ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile || bun install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DATABASE_URL="file:/app/prisma/dev.db"

RUN bunx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p .next data public/uploads && \
 chown -R bun:bun .next data public ./prisma

COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static

# The Ultimate Fix: Copy ALL node_modules from the builder stage.
# This guarantees zero network operations during final assembly.
COPY --from=builder --chown=bun:bun /app/node_modules ./node_modules

USER bun

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run DB push to automatically sync SQLite schema skipping legacy Postgres lockfiles, then start server
CMD ["sh", "-c", "bunx prisma db push --accept-data-loss && bun server.js"]
