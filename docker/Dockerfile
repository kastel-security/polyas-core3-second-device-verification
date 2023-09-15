FROM node:16 AS builder
ARG FINGERPRINT
ARG URL

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . ./
RUN  sed "s/VITE_FINGERPRINT=[0-9a-f]*/VITE_FINGERPRINT=${FINGERPRINT}/g" /app/.env > /app/.env_tmp
RUN  sed "s/VITE_BACKEND=[a-zA-Z0-9|.]*/VITE_BACKEND=" ${URL}"/g" /app/.env_tmp > /app/.env
RUN rm /app/.env_tmp
RUN npm run build

FROM nginx
# ENTRYPOINT ["tail", "-f", "/dev/null"] # For debugging only
ARG SERVER_NAME
ARG ADMIN
ARG POLYAS
ARG CERT
ARG KEY
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/mime.types /etc/nginx/mime.types
RUN sed "s/##NAME##/"${ ${SERVER_NAME}}"/g" /etc/nginx/nginx.conf > /etc/nginx/nginx_tmp.conf
RUN sed "s/##URL##/"${ ${POLYAS}}"/g" /etc/nginx/nginx_tmp.conf > /etc/nginx/nginx.conf
RUN sed "s/##ADMIN##/${ADMIN}/g" /etc/nginx/nginx.conf > /etc/nginx/nginx_tmp.conf
RUN mv /etc/nginx/nginx_tmp.conf /etc/nginx/nginx.conf

COPY ${CERT} /etc/ssl/certs/second-device.crt
COPY ${KEY} /etc/ssl/private/second-device.key