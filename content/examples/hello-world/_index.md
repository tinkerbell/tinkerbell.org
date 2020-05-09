+++
title = "Hello World!"
date = 2020-05-06T16:16:15+05:30
draft = false
weight = 10
toc = true
+++

Here is an example to execute the most simple workflow that says "Hello World!".

### Prerequisite

You have a setup ready with a provisioner and a worker node. If not, please follow the steps [here](setup.md) to complete the setup.

### Action images

The workflow will have a single task that will have a single action. The action here is to say `Hello-world!`, so we will push the action image to the Docker registry on provisioner:
```shell
$ docker pull hello-world
$ docker tag hello-world <registry-host>/hello-world
$ docker push <registry-host>/hello-world
```

### Workflow Template

Below is the template for this workflow. Save this template as `hello-world.tmpl`.
```yaml
version: '0.1'
name: hello_world_workflow
global_timeout: 600
tasks:
- name: "hello world"
  worker: "{{.device_1}}"
  actions:
  - name: "hello_world"
    image: hello-world
    timeout: 60
```


### Workflow

We can now define a workflow with the following steps:
 - Create a template:
 ```shell
  $ tink template create -n hello-world -p hello-world.tmpl
 ```
 - Create a workflow:
 ```shell
  $ tink workflow create -t <template-uuid> -r '{"device_1": "mac/IP"}'
 ```
 - Reboot the worker machine
