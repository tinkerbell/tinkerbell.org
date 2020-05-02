+++
title = "Action Images"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 40
toc = true
+++

- Push the worker image responsible for retrieving and executing the workflows for the worker to the registry.

```sh
docker pull quay.io/tinkerbell/tink-worker:latest
docker tag quay.io/tinkerbell/tink-worker:latest 192.168.1.1/tink-worker
docker push 192.168.1.1/tink-worker
```

- The registry must have an image for all the actions in a workflow.
  To push an action image:
```sh
docker tag <action-image> <registry-host>/<action-image>
docker push <registry-host>/<action-image>
```

- For this demo, we are going to need an action image for displaying hello-world.
```sh
docker pull hello-world
docker tag hello-world 192.168.1.1/hello-world
docker push 192.168.1.1/hello-world
```
