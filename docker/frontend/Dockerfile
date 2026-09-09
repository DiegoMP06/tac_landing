FROM node:24-alpine

USER root

RUN deluser --remove-home node && \
    addgroup -g 1000 -S lomi && \
    adduser -u 1000 -S lomi -G lomi -h /home/lomi -s /bin/bash

RUN mkdir -p /app \
    /home/lomi/.vscode-server \
    /home/lomi/.code-server \
    /home/lomi/.composer && \
    chown -R lomi:lomi /app /home/lomi

WORKDIR /app

RUN apk add --no-cache \
    bash \
    git \
    curl \
    openssh \
    libstdc++ \
    libc6-compat \
    gcompat

RUN npm i -g pnpm@latest

USER lomi

EXPOSE 4321