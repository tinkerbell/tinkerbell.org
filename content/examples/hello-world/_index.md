+++
title = "Hello World!"
date = 2020-05-06T16:16:15+05:30
draft = false
weight = 10
toc = true
+++

Here is an example to execute the most simple workflow that says "Hello World!".

### Prerequisite

You have a setup ready with a provisioner and a worker node. If not, please follow the steps [here](/setup) to complete the setup.

### Action images

The workflow will have a single task that will have a single action. The action here is to say `Hello-world!`, so we will push the action image to the Docker registry on provisioner:

```
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

{{% notice note %}}
 Here _device_1_ is the key for which the corresponding value will appear when the template is rendered. Value for _device_1_ is fetched from data passed with `tink workflow create` command as mentioned below. For more information about it look into template section of [concepts](/concepts).
{{% /notice %}}

### Workflow

We can now create/define a workflow with the following steps:

 - Push/Inject the hardware data

 ```
  $ tink hardware push --file <file in which you have the hardware data in json format>
 ```

 {{% notice note %}}
 To know more about hardware data visit this [hardware-data-page](/setup/packet/hardware-data/)
 {{% /notice %}}

 - Create a template:
 
 ```
  $ tink template create -n hello-world -p hello-world.tmpl
 ```

 - Create a workflow:

 ```
  $ tink workflow create -t <template-uuid> -r '{"device_1": "MAC address/IP address"}'
 ```

 {{% notice note %}}
  Here you need to replace the value of _device_1_ with the actual MAC address or IP address of the hardware/device. This is the device/hardware on which your workflow will run. Look at the following example:
  
  ```
  $ tink workflow create -t <template-uuid> -r '{"device_1": "00:00:00:00:00:00"}'
  or
  $ tink workflow create -t <template-uuid> -r '{"device_1": "192.168.1.1"}'
  ```
 {{% /notice %}}

 - Reboot the worker machine
