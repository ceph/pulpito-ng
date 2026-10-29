#!/usr/bin/env sh
set -ex
export VITE_PADDLES_SERVER
export VITE_MACHINE_TYPE
export VITE_TEUTHOLOGY_API
if [ -n "${PULPITO_PADDLES_ADDRESS}" ]; then
    VITE_PADDLES_SERVER=${PULPITO_PADDLES_ADDRESS}
fi

cd /app/

if [ "$DEPLOYMENT" = "development" ]; then
    echo "DEVELOPMENT MODE"
    exec npm run dev
else
    exec npm run server:prod
fi
