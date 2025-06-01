# Stage 1: build
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY nx.json tsconfig*.json ./
COPY .npmrc* ./

COPY apps/user-service/prisma ./apps/user-service/prisma/

RUN npm ci --include=dev

RUN npx prisma generate --schema=./apps/user-service/prisma/schema.prisma
COPY . .

RUN npx nx build user-service --prod --verbose

# Stage 2: produzione
FROM node:18-alpine
WORKDIR /usr/src/app

RUN apk add --no-cache dumb-init

# Utente non-root per sicurezza
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copia l'applicazione buildata
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/dist/apps/user-service ./

# Copia prisma schema e client generato
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/apps/user-service/prisma ./prisma/
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/node_modules/@prisma ./node_modules/@prisma/

COPY --chown=nextjs:nodejs package*.json ./

# Installa solo dipendenze di produzione (include @prisma/client)
RUN npm ci --omit=dev && npm cache clean --force

USER nextjs

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "main.js"]
