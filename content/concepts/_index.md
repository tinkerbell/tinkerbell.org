+++
title = "Concepts"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 20
toc = true
+++

### Hardware

A *hardware device* is defined separately and is substituted in a template at the time of creating a workflow.

### Hardware Data

Hardware data holds the details about the hardware that you wish to use with a workflow.
A hardware may have multiple network devices that can be used in a worklfow.
The details about all those devices is maintained in JSON format as hardware data.
Here is a sample of minimal hardware data that can get you started with a simple [Hello World!](/examples/hello-world) workflow.
```json
{
  "id": "ce2e62ed-826f-4485-a39f-a82bb74338e2",
  "arch": "x86_64",
  "allow_pxe": true,
  "allow_workflow": true,
  "facility_code": "onprem",
  "ip_addresses": [
    {
      "address": "192.168.1.5",
      "address_family": 4,
      "enabled": true,
      "gateway": "192.168.1.1",
      "management": true,
      "netmask": "255.255.255.248",
      "public": false
    }
  ],
  "network_ports": [
    {
      "data": {
        "mac": "ec:0d:9a:bf:ff:dc"
      },
      "name": "eth0",
      "type": "data"
    }
  ]
}
```
The following section explains each top-level property:

|  Property | Description |
|-----------|-------------|
|id         |A UUID used to uniquely identify the hardware. The `id` can be generated using the `uuidgen`. If you are in Packet environment, you can get the `id` from the server overview page.|
|arch       |The hardware architecture. Example: `x86_64`|
|allow_pxe  |Must be set to `true` to PXE; `false` otherwise.|
|allow_workflow|Must be set to `true` to execute a workflow.|
|facility_code|The Packet facility code where you have your setup running. For local setup, `onprem` or any other string value can be used.|
|ip_addresses|Details for DHCP.|
|ip_addresses.address|The worker IP address to be requested over DHCP.|
|network_ports|List of network devices (workers) on the hardware.|
|network_ports.data.mac|MAC address of the network device (worker).|


### Template

A template is a YAML definition which defines the overall workflow.
It is independent of a worker and therefore fetches the worker values using Go template when a workflow is created.
A user must write a template based on a valid template format.
Template can consist of custom variable which can be substituted before execution.
For example, worker is a targeted hardware is defined separately and is substituted in a template at the time of creating a workflow.

A template is stored as a blob in the database and is parsed later during the creation of a worflow.
A user can CRUD a template using the CLI (`tink template`).
Here is a sample workflow template:

```yaml
version: '0.1'
name: ubuntu_provisioning
global_timeout: 6000
tasks:
- name: "os-installation"
  worker: "{{.device_1}}"
  volumes:
    - /dev:/dev
    - /dev/console:/dev/console
    - /lib/firmware:/lib/firmware:ro
  environment:
    MIRROR_HOST: <MIRROR_HOST_IP>
  actions:
  - name: "disk-wipe"
    image: disk-wipe
    timeout: 90
  - name: "disk-partition"
    image: disk-partition
    timeout: 600
    environment:
       MIRROR_HOST: <MIRROR_HOST_IP>
    volumes:
      - /statedir:/statedir
  - name: "install-root-fs"
    image: install-root-fs
    timeout: 600
  - name: "install-grub"
    image: install-grub
    timeout: 600
    volumes:
      - /statedir:/statedir
```

A template comprises Tasks, which are executed in a sequential manner.
A task can consits multiple Actions.
As can be in the above example, a task supports volumes and environment variables.
The volumes and environment variables defined for a particular task level are inherited by each action in that particular task.

It is important to note that an action can also have its own volumes and environment variables.
Therefore, any entry at an action will overwrite the value defined at the task level.
For example, in the above template the `MIRROR_HOST` environment variable defined at action `disk-partition` will overwrite the value defined at task level.
However, the other actions will receive the original value defined at the task level.


A hardware device can be accessed in template like (refer above template):

```
{{.device_1}}
{{.device_2}}
```

 {{% notice note %}}
  These keys can only contain *letters*, *numbers* and *underscores*.
 {{% /notice %}}

### Provisioner

The provisioner machine is the main driver for executing a workflow.
A provisioner houses the following components:
 - [Database](/components/#database) (Postgres)
 - [Tinkerbell](/components/#tinkerbell) (CLI and server)
 - [Boots](/components/#boots)
 - [Hegel](/components/#hegel)
 - [Image Registry](/components/#image-repository)
 - [Elasticsearch](/components/#elasticsearch)
 - [Fluent Bit](/components/#fluent-bit)
 - [Kibana](/components/#kibana)
 - [NGINX](/components/#nginx)

It is upto you if you would like to divide these components into multiple servers.

### Worker

A worker is targeted hardware on which workflow needs to run.

Any node that has its data being pushed into Tinkerbell can become a part of a workflow.
A worker can be a part of multiple workflows.

When the node boots, a worker container starts and connects with provisioner to check if there is any task (may be from different workflows) that it can execute.
After the completion of an action, the worker sends action status to provisioner.
When all workflows which are related to a worker are complete, a worker can terminate.


### Ephemeral Data

The workers that are part of a workflow might require to share some data.
This can take the form of a light JSON like below, or some binary files that other workers might require to complete their action.
For instance, a worker may add the following data:

```json
 {"operating_system": "ubuntu_18_04", "mac_addr": "F5:C9:E2:99:BD:9B", "instance_id": "123e4567-e89b-12d3-a456-426655440000"}
```

The other worker may retrieve and use this data and eventually add some more:

```json
{"operating_system": "ubuntu_18_04", "mac_addr": "F5:C9:E2:99:BD:9B", "instance_id": "123e4567-e89b-12d3-a456-426655440000", "ip_addresses": [{"address_family": 4, "address": "172.27.0.23", "cidr": 31, "private": true}]}
```
![](/images/docs/ephemeral-data.png)
