# ─── Stage: Production ───────────────────────────────────────────────────────
# node:20-alpine → ~180MB base, final image ~80MB with only express+morgan
FROM node:20-alpine

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only backend package files (NOT root package.json with all Expo deps)
COPY backend/package*.json ./

# Install ONLY backend production deps (express, morgan — nothing else)
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy only the backend server file
COPY backend/server.js ./

# Drop to non-root user
USER appuser

EXPOSE 3000

# Docker health probe — used by Jenkins and container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]