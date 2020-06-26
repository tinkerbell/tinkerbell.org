+++
title = "How Tinkerbell Works"
date = 2020-06-25
draft = false
weight = 20
toc = true
+++

The purpose of Tinkerbell is to spin up and image multiple servers or machines in a data center or other isolated network environment in a consistent, reusable, and programmatic manner. To accomplish this it uses a set user-defined configuration files: Hardware Data, a Template, a Workflow. In addition, Tinkerbell enables Workers to share and modify any data they need to complete or update their configurations. You create and interact with these files through the `tink-cli`.

## The Hardware Data

Tinkerbell uses hardware data to identify the hardware used in a Workflow. It the contains metadata and details that describe the hardware on a Worker, in including network interfaces, storage disks, and file systems. Hardware data is JSON formatted, and stored on the Provisioner in PostgreSQL.

Here is a sample of Hardware Data:
```json
{
  "id": "0eba0bf8-3772-4b4a-ab9f-6ebe93b90a94",
  "metadata": {
    "facility": {
      "facility_code": "ewr1",
      "plan_slug": "c2.medium.x86",
      "plan_version_slug": ""
    },
    "instance": {},
    "state": ""
  },
  "network": {
    "interfaces": [
      {
        "dhcp": {
          "arch": "x86_64",
          "ip": {
            "address": "192.168.1.5",
            "gateway": "192.168.1.1",
            "netmask": "255.255.255.248"
          },
          "mac": "00:00:00:00:00:00",
          "uefi": false
        },
        "netboot": {
          "allow_pxe": true,
          "allow_workflow": true
        }
      }
    ]
  }
}
```

It is pushed to the database using the `tink hardware push` command.

## The Template

A Template is a YAML definition which defines the actions and tasks in the Workflow. It is independent of the Hardware Data which is defined separately and is substituted in a template at the time of creating a Workflow. 

A template is comprised of _tasks_, which are executed sequentially, in the order in which they are declared. Each task may consist of multiple _actions_. Each task supports its own volumes, workers, and environment variables. The volumes and environment variables defined for a particular task are inherited by each action in that particular task.

A template may include custom variables which will be substituted before execution in a Workflow.

Here is a sample template:

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

A hardware device, such as a Worker's Hardware Data, can be accessed in template as:
```
{{.device_1}}
{{.device_2}}
```
These keys can only contain _letters_, _numbers_ and _underscores_.

Templates are each stored as blobs in the database; they are later parsed during the creation of a workflow. You can CRUD a template using the `tink template` command.

### Action Images

A template is comprised of _tasks_, which are executed sequentially, in the order in which they are declared. Each task may consist of multiple _actions_. An action's image is the particular image, script, or other process that runs on the Worker as part of executing a Workflow. The timeout for the execution has units in seconds.  

It is important to note that an action can also have its own volumes and environment variables. Any entry at an action will overwrite the value defined at the task level. For example, in the above template the `MIRROR_HOST` environment variable defined at action `disk-partition` will overwrite the value defined at task level. The other actions will receive the original value defined at the task level.

## The Workflow

A Workflow is the complete set of operations to be run on a Worker, as specified by its Hardware Data and the tasks and actions in the Template. 

Workflows are created with the `tink workflow create` command from the Hardware Data and the Template, that also stores it in the database so the Worker can retrieve it.

## Ephemeral Data

Once a Workflow (or Workflows) have been completed by the Worker, they can continue to send and receive information from the Provisioner in order to share data. This can take the form of a light JSON like below, or some binary files that other workers might require to complete their action.
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

## The Execution

Step 1. Define the hardware data of the Workers. Create a Template of tasks (action images), to be run on the Worker after it is started and joined to the Tinkerbell stack.

Step 2. Combine the Hardware Data and the Template in to a Workflow.

Step 3. Spin up a Worker. It calls back to the Provisioner, which will push the Workflows associated with that particular Worker's Hardware Data.

Step 4. The Worker executes the tasks (action images) from the Template.

Step 5. As part of the ongoing operations of the Worker it can reach out to the Provisioner, in order to share data to/from it or other Workers.

![Architecture](/images/docs/ephemeral-data.png)

