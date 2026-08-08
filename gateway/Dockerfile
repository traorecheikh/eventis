# Contexte de build : la racine du depot (voir docker-compose.yml), pour
# pouvoir construire frontend/ dans cette meme image, conformement a l'ADR
# 0005 (un seul conteneur Nginx sert le build Vue et proxifie /api/*).

FROM node:24-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM nginx:alpine
COPY gateway/nginx.conf /etc/nginx/nginx.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD wget -qO- http://localhost/health || exit 1
