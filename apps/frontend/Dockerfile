# Build stage
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY nx.json tsconfig*.json ./
COPY .npmrc* ./

# npm ci per build riproducibili
RUN npm ci --include=dev

COPY . .
RUN npx nx build frontend --prod --verbose

# Serve stage
FROM nginx:alpine

COPY --from=builder /usr/src/app/dist/apps/frontend /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]