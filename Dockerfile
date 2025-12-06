# ===========================================
# PRODUCTION DOCKERFILE
# ===========================================
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies required for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json yarn.lock* package-lock.json* ./

# Install all dependencies
RUN npm ci --legacy-peer-deps || yarn install --frozen-lockfile

# Copy source code
COPY . .

# Create public folder if it doesn't exist
RUN mkdir -p public

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files and install production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock* ./
COPY --from=builder /app/package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps || yarn install --production --frozen-lockfile

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Copy custom server and socket files
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/lib ./lib

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start with custom server (required for Socket.IO)
CMD ["node", "server.js"]
