# Stage 1: build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY nx.json tsconfig*.json ./
COPY .npmrc* ./

RUN npm ci --include=dev

COPY . .
RUN npx nx build api-gateway --prod --verbose

# Stage 2: produzione
FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache dumb-init

# Utente non-root per sicurezza
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copia package.json per installare solo prod dependencies
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/dist/apps/api-gateway ./
COPY --chown=nextjs:nodejs package*.json ./

# Installa solo dipendenze di produzion
RUN npm ci --omit=dev && npm cache clean --force

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "main.js"]

