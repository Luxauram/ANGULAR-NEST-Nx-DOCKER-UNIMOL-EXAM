# Social Network Database Project

> **Progetto Universitario** | Basi di Dati e Sistemi Informativi - Modulo 2  
> **UNIMOL** - Università degli Studi del Molise | A.A. 2024/2025  
> **Docente**: Prof. Remo Pareschi

## Team di Sviluppo

- **Luca D'Aurizio** - [GitHub Link]()
- **Luca Lanese** - [GitHub Link]()

## Descrizione del Progetto

Implementazione di un **social network** che integra diverse tipologie di database, dimostrando l'utilizzo ottimale di diversi paradigmi di gestione dati attraverso un'**architettura a microservizi** moderna e scalabile.

### Obiettivi

- **Primario**: Dimostrare la conoscenza dei diversi paradigmi di database (relazionali, documentali, a grafo, key-value)
- **Secondario**: Implementare un'applicazione funzionante che integri efficacemente sistemi eterogenei
- **Terziario**: Sperimentare architetture moderne basate su microservizi

## Architettura del Sistema

### Stack Tecnologico

**Frontend**

- Angular + TypeScript
- Interfaccia responsive e moderna

**Backend**

- Node.js + NestJS
- Nx (Monorepo management)
- API Gateway per coordinamento servizi

**Database**

- **PostgreSQL** - Gestione utenti e dati relazionali
- **MongoDB** - Contenuti e post (documenti semi-strutturati)
- **Neo4j** - Grafo sociale e relazioni
- **Redis** - Cache e feed personalizzati

**DevOps**

- Docker + Docker Compose
- Containerizzazione completa

### Microservizi e Motivazioni

| Servizio                 | Database   | Motivazione                                                       |
| ------------------------ | ---------- | ----------------------------------------------------------------- |
| **User Service**         | PostgreSQL | Integrità referenziale, transazioni ACID, dati critici            |
| **Post Service**         | MongoDB    | Schema flessibile, scalabilità orizzontale, contenuti variegati   |
| **Social Graph Service** | Neo4j      | Ottimizzazione per grafi, query di traversal, analisi relazioni   |
| **Feed Service**         | Redis      | Performance estreme, cache intelligente, accesso sub-millisecondi |

## Quick Start

### Prerequisiti

- Docker installato
- Node.js (installato per sviluppo locale)
- Git installato

### Avvio con Docker

```bash
# Clona il repository
git clone https://github.com/Luxauram/ANGULAR-NEST-Nx-DOCKER-UNIMOL-EXAM.git
cd ANGULAR-NEST-Nx-DOCKER-UNIMOL-EXAM

# Setup iniziale per user-service
cd apps/user-service
npx prisma generate
cd ../..

# Avvia tutti i servizi
docker compose up --build

# Per versione detached (senza logs)
docker compose up --build -d
```

### Setup Database

```bash
# Migrazioni Prisma nel container
docker exec -it social-network-db-project-user-service-1 npx prisma migrate dev --name init
```

### Sviluppo Locale

```bash
# Installa dipendenze
npm install

# Avvia tutti i servizi in sviluppo
npm run dev

# `npm run dev` equivale a:
# nx run-many --target=serve --projects=frontend,api-gateway,user-service,post-service,feed-service,social-graph-service --parallel --exclude=*-e2e
```

## Struttura del Progetto Riassuntiva

```
social-network-db-project/
├── apps/
│   ├── api-gateway/          # Gateway centrale per API
│   ├── feed-service/         # Gestione feed con Redis
│   ├── frontend/             # Applicazione Angular
│   ├── post-service/         # Gestione post con MongoDB
│   ├── social-graph-service/ # Grafo sociale con Neo4j
│   └── user-service/         # Gestione utenti con PostgreSQL
├── docker-compose.yml        # Orchestrazione servizi
├── libs/                     # Librerie condivise
└── tools/                    # Strumenti di build
```

## 🔧 Comandi Utili

### Gestione Nx

```bash
# Visualizza grafo delle dipendenze
npx nx graph

# Esegui test su tutti i progetti
npx nx run-many --target=test --all

# Build di produzione
npx nx run-many --target=build --all

# Lint del codice
npx nx run-many --target=lint --all
```

### Docker

```bash
# Rebuild completo
docker compose down && docker compose up --build

# Logs di un servizio specifico
docker compose logs -f <nome-servizio>

# Accesso shell in un container
docker exec -it <nome-servizio> /bin/bash
```

## Funzionalità Implementate

### Core Features

- ✅ **Registrazione e Autenticazione** - JWT-based
- ✅ **Gestione Profilo Utente** - CRUD completo
- ✅ **Creazione e Gestione Post** - Con supporto multimediale
- ✅ **Sistema Follow/Unfollow** - Grafo sociale dinamico
- ✅ **Feed Personalizzato** - Algoritmo di ranking
- ✅ **Sistema di Like** - Interazioni sociali
- ✅ **API Gateway** - Routing e autenticazione centralizzati

### Caratteristiche Tecniche

- **Sicurezza**: JWT, CORS, Rate limiting, Validazione input
- **Performance**: Caching con Redis, Query ottimizzate
- **Scalabilità**: Microservizi indipendenti, Load balancing
- **Monitoraggio**: Logging centralizzato, Health checks

## Metriche e Performance

- **Latenza**: Riduzione del 80% grazie al caching Redis
- **Throughput**: Migliaia di richieste simultanee
- **Scalabilità**: Ogni microservizio scala indipendentemente
- **Disponibilità**: Architettura fault-tolerant

## Sviluppo e Contribuzione

### Setup Ambiente di Sviluppo

```bash
# Installa Nx CLI globalmente
npm install -g nx

# Installa dipendenze
npm install
```

## Troubleshooting

### Problemi Comuni

**Errore Prisma generate**

```bash
cd apps/user-service
npx prisma generate
```

**Container non si avviano**

```bash
docker compose down -v
docker compose up --build
```

**Porte già in uso**

```bash
# Verifica porte occupate
netstat -tulpn | grep :3000
# Modifica docker-compose.yml se necessario
```

## Competenze Acquisite

### Database Management

- **PostgreSQL**: Schema relazionali, ottimizzazione query
- **MongoDB**: Aggregation pipeline, indexing
- **Neo4j**: Cypher queries, algoritmi di grafo
- **Redis**: Strutture dati avanzate, strategie di cache

### Architettura Software

- Microservizi e comunicazione inter-service
- API Gateway e service mesh
- Event-driven architecture
- DevOps e containerizzazione

### Full-Stack Development

- Frontend: Angular, TypeScript, RxJS
- Backend: NestJS, middleware, autenticazione
- Integration: REST APIs, WebSockets

## Sviluppi Futuri

- **Sistema di Raccomandazioni** - ML sui dati del grafo
- **Analytics Dashboard** - Insights e metriche
- **Messaggistica Real-time** - WebSocket integration
- **Content Moderation** - AI-powered
- **GraphQL API** - Alternativa più flessibile

## Documentazione Completa

La documentazione completa del progetto è [presente qui](./project-presentation.pdf), oppure si può convertire dal file md [presenti qui](./project-presentation.md) in questo modo:

```bash
# Richiede pandoc e xelatex installati
pandoc project-presentation.md -o project-presentation.pdf --pdf-engine=xelatex
```

## Licenza

Questo progetto è sviluppato per scopi didattici presso l'UNIMOL - Università degli Studi del Molise.

---

**⚠️ Nota di Sicurezza**: Per scopi didattici, tutte le `origins` sono impostate a `*` o `true`. In produzione, configurare appropriatamente CORS e altre misure di sicurezza.

---

Questo progetto è sviluppato per scopi didattici presso l'Università degli Studi del Molise.

---
