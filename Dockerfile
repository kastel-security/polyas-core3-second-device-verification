FROM node:alpine AS node
ENV REPO="https://github.com/kastel-security/polyas-core3-second-device-verification"
ARG NAME
ARG DIR
ARG ELECTION_URL 
ARG ELECTION_HASH
ARG ELECTION_FINGERPRINT
ARG ELECTION_BACKEND
ENV VITE_ELECTION_URL ${ELECTION_URL}
ENV VITE_ELECTION_HASH ${ELECTION_HASH}
ENV VITE_ELECTION_FINGERPRINT ${ELECTION_FINGERPRINT}
ENV VITE_ELECTION_BACKEND ${ELECTION_BACKEND}
# Cloning the repository
WORKDIR ${DIR}
RUN apk update --no-cache
RUN apk add --no-cache git
RUN git clone ${REPO} ${NAME}; rm -r ${NAME} && git clone ${REPO} ${NAME}
RUN git -C ${NAME} pull

# Build the frontend
RUN cd ${NAME} && rm -r .git
RUN cd ${NAME} && npm i
RUN cd ${NAME} && npm run build

FROM nginx:alpine
ARG NAME
ARG DIR
ARG ELECTION_URL
ARG ELECTION_HASH
ENV ELECTION_URL ${ELECTION_URL}
ENV ELECTION_HASH ${ELECTION_HASH}
COPY --from=node ${DIR}/${NAME}/dist/ /usr/share/nginx/html/
# COPY --from=node ${DIR}/${NAME}/nginx-template.template /etc/nginx/templates/default.conf.template
COPY ./nginx-template.template /etc/nginx/templates/default.conf.template