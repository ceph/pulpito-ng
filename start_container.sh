#!/usr/bin/env sh
set -ex

cd /app/

if [ "$DEPLOYMENT" = "development" ]; then
    echo "DEVELOPMENT MODE"
    npm run start
else
    npm run build
    npm run server:prod
fi
