# ============================================================
# frontend/Dockerfile
# KhadiCraft — React 18 / Vite (multi-stage build)
# ============================================================

# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first — Docker cache will skip npm install
# if these files haven't changed
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# Copy source and build
COPY . .
# VITE_API_BASE_URL is injected at build-time via docker-compose ARG/ENV
ARG VITE_API_BASE_URL=http://localhost/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────────
FROM nginx:1.27-alpine

LABEL maintainer="KhadiCraft by Goldy <hello@khadicraft.in>"

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy the Vite dist output
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config for React SPA (handles client-side routing)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
