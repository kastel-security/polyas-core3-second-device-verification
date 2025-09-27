#!/bin/sh
# Script to replace all environment variable placeholders set during build time with the actual values
for i in $(env | grep "DOCKER_APP_VITE_")
do
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2-)
    # Replace key with value in all files
    find /usr/share/nginx/html -type f -exec sed -i "s|${key}|${value}|g" '{}' +
    find /etc/nginx/conf.d -type f -exec sed -i "s|${key}|${value}|g" '{}' +
done
