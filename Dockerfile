FROM node:alpine
WORKDIR /srv/app
RUN apk update
RUN apk add git
RUN git clone "git@github.com:kastel-security/polyas-core3-second-device-verification.git" "polyas-verifier"; exit 0
RUN git -C "polyas-verifier" pull
RUN cd polyas-verifier && npm i
