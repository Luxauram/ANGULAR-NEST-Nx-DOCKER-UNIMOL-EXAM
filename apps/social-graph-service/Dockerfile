# Stage 1: build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY nx.json tsconfig*.json ./
COPY .npmrc* ./

RUN npm ci --include=dev

COPY . .

RUN npx nx build social-graph-service --prod --verbose

# Stage 2: produzione
FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache dumb-init

# Utente non-root per sicurezza
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /usr/src/app/dist/apps/social-graph-service ./

# Copia package.json per installare solo prod dependencies
COPY --chown=nextjs:nodejs package*.json ./

# Installa solo dipendenze di produzione
RUN npm ci --omit=dev && npm cache clean --force

USER nextjs

ENV NODE_ENV=production
ENV PORT=3004

EXPOSE 3004

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "main.js"]