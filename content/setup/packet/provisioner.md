+++
title = "Provisioner"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 10
toc = true
+++

SSH into the provisioner for the following steps:

{{% notice note %}}
From here on out, assume all code blocks are run in `bash` unless specified.
{{% /notice %}}

#### Run the setup script

The _setup.sh_ script will:

- configure the network
- download necessary files
- setup the certificates
- setup a Docker registry
- start tinkerbell components

The script is also separated into functions so you can rerun specific parts as needed.

```
$ wget https://raw.githubusercontent.com/tinkerbell/tink/master/setup.sh && chmod +x setup.sh
$ ./setup.sh
```

### Action Images

The worker is not open to the world and therefore does not have internet access.
The provisioner and the worker are connected over a private network.
Therefore, it's the responsibility of a user to push all workflow action images to the Docker registry at provisioner.
To push an action image to the registry use:

```
docker tag <action-image> <registry-host>/<action-image>
docker push <registry-host>/<action-image>
```
