FROM node:alpine AS builder
# ENV REPO="https://github.com/kastel-security/polyas-core3-second-device-verification"
ARG DIR=/home/app
WORKDIR ${DIR}

COPY package.json package-lock.json ${DIR}/

WORKDIR ${DIR}
RUN npm i

ARG ELECTION_URL 
ARG ELECTION_HASH
ARG ELECTION_FINGERPRINT
ARG ELECTION_BACKEND
ENV VITE_ELECTION_URL ${ELECTION_URL}
ENV VITE_ELECTION_HASH ${ELECTION_HASH}
ENV VITE_ELECTION_FINGERPRINT ${ELECTION_FINGERPRINT}
ENV VITE_ELECTION_BACKEND ${ELECTION_BACKEND}

# Cloning the repository
#RUN apk update --no-cache
#RUN apk add --no-cache git
#RUN git clone ${REPO} ${NAME}; exit 0; rm -r ${NAME} && git clone ${REPO} ${NAME}; exit 0
#RUN git -C ${NAME} pull

COPY ./ ./
# Build the frontend
#RUN cd ${NAME} && rm -r .git
RUN npm run build

FROM nginx:alpine AS deploy
ARG DIR=/home/app

COPY --from=builder ${DIR}/dist /usr/share/nginx/html

# COPY --from=node ${DIR}/${NAME}/nginx-template.template /etc/nginx/templates/default.conf.template
COPY .nginx/nginx-proxy.conf /etc/nginx/conf.d/default.conf
COPY .nginx/00-set-environment-variables.sh /docker-entrypoint.d/00-set-environment-variables.sh
RUN chmod +x /docker-entrypoint.d/00-set-environment-variables.sh
