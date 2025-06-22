#!/bin/sh

# Подстановка переменных окружения в конфиги
envsubst '${NGINX_HOST} ${NGINX_HOST_API_PROJECTS} ${NGINX_PORT_API_PROJECTS} ${NGINX_HOST_API_AUTH} ${NGINX_PORT_API_AUTH}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Запуск Nginx
exec nginx -g "daemon off;"
