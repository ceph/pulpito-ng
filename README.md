# pulpito-ng

This is a rewrite of [Pulpito](https://github.com/ceph/pulpito) in React, in
its early stages. Many, but not all, of the original Pulpito's features have
been implemented.

## Getting Started

You'll need at least [node v17](https://nodejs.org/en/download). Once you've got that, start in development mode with:

    $ npm install
    $ npm run start

## Integrate with teuthology docker setup

If you want to develop in a container environment
and connect to other teuthology services, here is what
you can do:

In [teuthology's docker-compose](https://github.com/ceph/teuthology/blob/main/docs/docker-compose/docker-compose.yml) replace `pulpito` service with the following:

```
  pulpito:
    build:
      context: ../../../pulpito-ng
    environment:
      REACT_APP_PADDLES_SERVER: http://0.0.0.0:8080
    depends_on:
      paddles:
        condition: service_healthy
      teuthology_api:
        condition: service_healthy
    links:
      - paddles
      - teuthology_api
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://0.0.0.0:8081" ]
      timeout: 5s
      interval: 10s
      retries: 2
    ports:
      - 8081:8081
```
[recommended] For developement purposes:
Add the following to `pulpito-ng` container:

```
pulpito-ng:
    environment:
      DEPLOYMENT: development
    volumes:
      - ../../../pulpito-ng:/app/:rw
      - /app/node_modules
```