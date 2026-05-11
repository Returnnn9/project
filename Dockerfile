FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy prisma schema before npm ci so postinstall can generate the client
COPY prisma ./prisma
COPY package.json package-lock.json* ./
RUN npm config set registry https://registry.npmmirror.com && npm ci

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set a dummy DATABASE_URL for build-time schema validation
ENV DATABASE_URL="file:/app/prisma/dev.db"

# Generate Prisma Client
RUN npx prisma generate

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Create mandatory directories and set permissions
RUN mkdir -p .next data public/uploads && \
    chown -R nextjs:nodejs .next data public ./prisma

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install prisma CLI for running migrations in production
RUN npm install prisma@^6.19.3

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to all interfaces
ENV HOSTNAME="0.0.0.0"

# Run migrations and then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
