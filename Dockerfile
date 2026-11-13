# Image du frontend InternatAdmin :
#   docker build -t daara-frontend:local .
#
# Etape 1 : build de production Angular. Les tests et les audits passent avant, dans la chaine CI.
# Etape 2 : Nginx non root (utilisateur 101, port 8080) qui sert l'application et relaie /api vers le backend.
# Aucun secret dans l'image : BACKEND_URL est une adresse, modifiable au lancement du conteneur.

ARG BUILD_IMAGE=node:24-alpine
ARG RUNTIME_IMAGE=nginxinc/nginx-unprivileged:1.30-alpine

FROM ${BUILD_IMAGE} AS build
WORKDIR /src

COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit

COPY angular.json tsconfig.json tsconfig.app.json .postcssrc.json ./
COPY public/ public/
COPY src/ src/
RUN npx ng build --configuration production

FROM ${RUNTIME_IMAGE}
LABEL org.opencontainers.image.title="daara-frontend" \
      org.opencontainers.image.description="InternatAdmin, frontend Angular servi par Nginx"

# l'image de base publiee peut etre en retard sur les correctifs Alpine signales par Trivy
USER root
RUN apk upgrade --no-cache

# NGINX_ENTRYPOINT_LOCAL_RESOLVERS : le script d'entree de l'image renseigne NGINX_LOCAL_RESOLVERS
ENV BACKEND_URL=http://backend:8080 \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1

# fichiers en lecture seule pour l'utilisateur Nginx (proprietaire root)
COPY --from=build /src/dist/InternatAdmin/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/templates/default.conf.template

USER 101:101
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
