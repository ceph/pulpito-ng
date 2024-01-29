#!/usr/bin/env sh
set -ex
trap exit TERM

cd /app/

if [ "$DEPLOYMENT" = "development" ]; then
    echo "DEVELOPMENT MODE"
    npm run start
else
    chown -R node:node /app
    npm run build
    npm run serve -- --host
fi