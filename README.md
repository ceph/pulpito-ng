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
[recommended] For development purposes:
Add the following to `pulpito-ng` container:

```
pulpito-ng:
    environment:
      DEPLOYMENT: development
    volumes:
      - ../../../pulpito-ng:/app/:rw
      - /app/node_modules
```

## Deploying in OpenShift

``Dockerfile.ocp`` and the files under ``openshift/`` are files used to deploy pulpito-ng in OpenShift.

You may wish to change the number of replicas in ``openshift/pulpito-ng-deploy.yaml`` depending on how many worker nodes you have.

To deploy:

Create a new project (if necessary)
```
oc new-project pulpito
```

Create the Image Stream
```
oc -n pulpito apply -f openshift/pulpito-ng-imagestream.yaml
```

Modify the Build Config if necessary and start the build
```
oc -n pulpito apply -f openshift/pulpito-ng-build.yaml
```

Define the paddles URL
```
oc -n pulpito set env bc/pulpito-ng \
  REACT_APP_PADDLES_SERVER=http://paddles.example.com
```

Start the build
```
oc -n pulpito start-build pulpito-ng --follow
```

Deploy!
```
oc -n pulpito apply -f openshift/pulpito-ng-deploy.yaml

oc -n pulpito get route pulpito-ng
```

### Deploying code changes in OpenShift

If you just want to deploy the latest code in ``main`` (and your Build Config in ``openshift/pulpito-ng-build.yaml`` doesn't have a different branch defined),

(Note, the ``--follow`` will likely timout if you do not wait for the first build from above to finish)
```
oc -n pulpito start-build pulpito-ng --follow
```

If you wish to deploy code from a different pulpito-ng.git branch,

Start a one-off build of the branch.  The deployment will automatically roll this out.
```
oc -n pulpito start-build pulpito-ng --follow --commit=<branch-name>
```

To make the deployment use this branch permanently, modify ``spec.source.git.ref:`` in ``openshift/pulpito-ng-build.yaml``, and build it:
```
oc -n pulpito apply -f openshift/pulpito-ng-build.yaml

oc -n pulpito start-build pulpito-ng --follow
```
