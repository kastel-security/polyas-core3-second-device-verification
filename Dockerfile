FROM node:alpine
ENV REPO="git@github.com:kastel-security/polyas-core3-second-device-verification.git"
ARG NAME
ARG DIR
WORKDIR ${DIR}
RUN apk update
RUN apk add git
RUN git clone ${REPO} ${NAME}; exit 0
RUN git -C ${NAME} pull
RUN cd ${NAME} && npm i
