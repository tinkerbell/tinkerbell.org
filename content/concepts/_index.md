+++
title = "Concepts"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 20
toc = true
+++

### Hardware

A _hardware device_ is defined separately and is substituted in a template at the time of creating a workflow.

### Template

A template is a YAML definition which defines the overall workflow.
It is independent of a worker and therefore fetches the worker values using Go template when a workflow is created.
A user must write a template based on a valid template format.
A template may include custom variables which will be substituted before execution.
For example, in the below, _worker_ is targeted hardware that is defined separately and is substituted in a template at the time of creating a workflow.

Templates are each stored as blobs in the database; they are later parsed, during the creation of a worflow.

A user can CRUD a template using the CLI (`tink template`).

Here is a sample workflow template:

```yaml
version: "0.1"
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

A template is comprised of _tasks_, which are executed sequentially, in the order in which they are declared.
A task may consist of multiple _actions_.
As shown in the above example, a task supports volumes and environment variables.
The volumes and environment variables defined for a particular task are inherited by each action in that particular task.

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
These keys can only contain _letters_, _numbers_ and _underscores_.
{{% /notice %}}

### Ephemeral Data

The workers that are part of a workflow might require to share some data.
This can take the form of a light JSON like below, or some binary files that other workers might require to complete their action.
For instance, a worker may add the following data:

```json
{
  "instance_id": "123e4567-e89b-12d3-a456-426655440000",
  "mac_addr": "F5:C9:E2:99:BD:9B",
  "operating_system": "ubuntu_18_04"
}
```

The other worker may retrieve and use this data and eventually add some more:

```json
{
  "instance_id": "123e4567-e89b-12d3-a456-426655440000",
  "ip_addresses": [
    {
      "address_family": 4,
      "address": "172.27.0.23",
      "cidr": 31,
      "private": true
    }
  ],
  "mac_addr": "F5:C9:E2:99:BD:9B",
  "operating_system": "ubuntu_18_04"
}
```

![](/images/docs/ephemeral-data.png)
