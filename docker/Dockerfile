FROM node:16 AS builder
ARG FINGERPRINT
ARG URL

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . ./
RUN  sed -i "s/VITE_FINGERPRINT=[0-9a-f]*/VITE_FINGERPRINT=${FINGERPRINT}/g" /app/.env
RUN URL_ESC=$(echo ${URL} | sed -r 's/\//\\\//g'); sed "s/VITE_BACKEND=[a-zA-Z0-9|.]*/VITE_BACKEND=${URL_ESC}/g" /app/.env
RUN npm run build

FROM nginx
# ENTRYPOINT ["tail", "-f", "/dev/null"] # For debugging only
ARG SERVER_NAME
ARG ADMIN
ARG INSTANCE
ARG CERT
ARG KEY
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/mime.types /etc/nginx/mime.types
RUN SERVER_ESC=$(echo ${SERVER_NAME} | sed -r 's/\//\\\//g'); sed -i "s/##NAME##/${SERVER_ESC}/g" /etc/nginx/nginx.conf
RUN INSTANCE_ESC=$(echo ${INSTANCE} | sed -r 's/\//\\\//g'); sed -i "s/##URL##/${INSTANCE_ESC}/g" /etc/nginx/nginx.conf
RUN sed -i "s/##ADMIN##/${ADMIN}/g" /etc/nginx/nginx.conf

COPY ${CERT} /etc/ssl/certs/second-device.crt
COPY ${KEY} /etc/ssl/private/second-device.key

