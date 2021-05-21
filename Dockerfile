FROM nginx
ADD dist /usr/share/nginx/html/management
ADD nginx.conf /etc/nginx/nginx.conf
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD [ "nginx", "-g", "daemon off;"]
EXPOSE 80

