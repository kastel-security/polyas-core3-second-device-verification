FROM node:alpine AS builder
# ENV REPO="https://github.com/SecUSo/polyas-core3-second-device-verification"
ARG DIR=/home/app
WORKDIR ${DIR}
COPY package.json package-lock.json ${DIR}/

WORKDIR ${DIR}
RUN npm install

# Set placeholder values to later be replaced by the entrypoint script with the actual values
ENV VITE_MODE="DOCKER_APP_VITE_MODE"
ENV VITE_ELECTION_URL="DOCKER_APP_VITE_ELECTION_URL"
ENV VITE_ELECTION_HASH="DOCKER_APP_VITE_ELECTION_HASH"
ENV VITE_ELECTION_FINGERPRINT="DOCKER_APP_VITE_ELECTION_FINGERPRINT"
ENV VITE_ELECTION_BACKEND="DOCKER_APP_VITE_ELECTION_BACKEND"

COPY ./ ./
RUN npm run build

FROM nginx:latest AS deploy
ARG DIR=/home/app

COPY --from=builder ${DIR}/dist /usr/share/nginx/html

COPY .nginx/nginx-proxy.conf /etc/nginx/conf.d/default.conf
COPY .nginx/00-set-environment-variables.sh /docker-entrypoint.d/00-set-environment-variables.sh
RUN chmod +x /docker-entrypoint.d/00-set-environment-variables.sh
