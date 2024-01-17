FROM nginx:1.24.0-alpine

RUN apk update
RUN apk add --no-cache git libc-dev gcc nano bash
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

WORKDIR /usr/src/app