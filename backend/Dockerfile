FROM richarvey/nginx-php-fpm:latest

COPY . .

ENV WEBROOT /var/www/html/public
ENV SKIP_COMPOSER 0
ENV RUN_SCRIPTS 1
ENV REAL_IP_HEADER 1

CMD ["/start.sh"]