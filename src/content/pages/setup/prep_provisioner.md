---
title: 'Prepare the provisioner'
date: 2019-01-04T16:16:15+05:30
draft: false
weight: 30
toc: true
---

{{% notice note %}}
From here on out, assume all code blocks are run in bash unless specified.
{{% /notice %}}

SSH into tf-provisioner for the following portion.

#### Run the setup script

The _setup.sh_ script will configure the network, download necessary files, set up the certs and registry, and bring up the stack.
The script is also separated into functions so you can rerun specific parts as needed.

```sh
$ wget https://raw.githubusercontent.com/tinkerbell/tink/master/setup.sh && chmod +x setup.sh
$ ./setup.sh
```
