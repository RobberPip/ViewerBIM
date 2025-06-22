FROM nginx:latest

# Копируем конфиги
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY conf.d /etc/nginx/conf.d

# Копируем entrypoint скрипт
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Открываем порт 80
EXPOSE 80

# Устанавливаем entrypoint
ENTRYPOINT ["/bin/sh", "/docker-entrypoint.sh"]
