# Build stage
FROM node:18-alpine AS builder

# Imposta la working directory alla root del monorepo
WORKDIR /usr/src/app

# Copia i file di configurazione del monorepo
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY .npmrc* ./

# Installa le dipendenze
RUN npm ci --include=dev

# Copia tutto il codice sorgente
COPY . .

# Build del frontend con NX
RUN npx nx build frontend --prod

# Serve stage
FROM nginx:alpine

# Copia i file buildati
COPY --from=builder /usr/src/app/dist/apps/frontend /usr/share/nginx/html

# Copia la configurazione nginx personalizzata
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]