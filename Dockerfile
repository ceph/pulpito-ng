FROM node:25-alpine
EXPOSE 8081
ENV PORT 8081
ENV npm_config_cache /home/node/.npm
WORKDIR /app
RUN apk add curl
COPY --parents [ \
  "Dockerfile", \
  "index.html", \
  "package-lock.json", \
  "package.json", \
  "public", \
  "README.md", \
  "start_container.sh", \
  "tsconfig.json", \
  "vite.config.mts", \
  "/app/" \
]
COPY ./src/ /app/src
RUN \
  mkdir -p /app/node_modules/.vite && \
  npm install && \
  npm run build
COPY . .
CMD sh /app/start_container.sh
