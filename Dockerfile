FROM node:25-alpine
EXPOSE 8081
ENV PORT 8081
ENV npm_config_cache /home/node/.npm
WORKDIR /app
RUN apk add curl
COPY [ \
  "Dockerfile", \
  "index.html", \
  "package-lock.json", \
  "package.json", \
  "README.md", \
  "start_container.sh", \
  "tsconfig.json", \
  "vite.config.mts", \
  "/app/" \
]
COPY ./public/ /app/public
COPY ./src/ /app/src
RUN \
  npm install && \
  npm run build
COPY . .
CMD sh /app/start_container.sh
