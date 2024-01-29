FROM node:20-alpine
EXPOSE 8081
ENV npm_config_cache /home/node/.npm
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN \
  mkdir -p /app/node_modules/.vite && \
  npm install
COPY . .
CMD sh /app/start_container.sh