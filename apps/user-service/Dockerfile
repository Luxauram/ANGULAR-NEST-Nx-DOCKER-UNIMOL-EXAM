# Stage 1: build
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Dipendenze per Prisma
RUN apk add --no-cache openssl libc6-compat

# File di configurazione
COPY package*.json ./
COPY nx.json tsconfig*.json ./
COPY .npmrc* ./

# Schema Prisma PRIMA dell'installazione
COPY apps/user-service/prisma ./apps/user-service/prisma/

# NPM install + Generazione client Prisma
RUN npm ci --include=dev
RUN npx prisma generate --schema=./apps/user-service/prisma/schema.prisma

# Code copy + build
COPY . .
RUN npx nx build user-service --prod --verbose

# Stage 2: produzione
FROM node:18-alpine
WORKDIR /usr/src/app

# Dipendenze + dumb-init
RUN apk add --no-cache dumb-init openssl libc6-compat

# Utente non-root (per sicurezza)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copia file di configurazione
COPY --chown=nextjs:nodejs package*.json ./

# Copia l'applicazione buildata
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/dist/apps/user-service ./

# Copia Prisma schema + client generato
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/apps/user-service/prisma ./prisma/
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/node_modules/@prisma ./node_modules/@prisma/

# NPM install prod (include @prisma/client)
RUN npm ci --omit=dev && npm cache clean --force

# Cambia utente non-root
USER nextjs

# Variabili di ambiente
ENV NODE_ENV=production
ENV PORT=3001

# Porta Esposta
EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]

# Comando per gestione robusta
CMD ["sh", "-c", "npx prisma migrate deploy 2>/dev/null || echo '⚠️ Migrations skipped' && echo '🚀 Starting application...' && node main.js"]
