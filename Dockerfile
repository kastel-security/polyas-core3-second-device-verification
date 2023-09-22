FROM node:alpine
ENV REPO="https://github.com/kastel-security/polyas-core3-second-device-verification"
ARG NAME
ARG DIR
WORKDIR ${DIR}
RUN apk update
RUN apk add --no-cache git
RUN git clone ${REPO} ${NAME}; exit 0
RUN git -C ${NAME} pull
RUN cd ${NAME} && npm i
