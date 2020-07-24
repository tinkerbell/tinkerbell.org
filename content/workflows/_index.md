+++
title = "Workflows"
date = 2020-07-24
draft = false
weight = 30
toc = true
+++

A Workflow is the complete set of operations to be run on a Worker, as identified by its hardware data, and according to the tasks and actions in a template.

Workflows are created with the `tink workflow create` command, taking a template ID and a JSON object comprised of the MAC address or IP address of a Worker tagged with how it will be referenced in the template. 

For example, 
```
tink workflow create \
    -t 75ab8483-6f42-42a9-a80d-a9f6196130df \
    -r '{"device_1":"08:00:27:00:00:01"}'
> Created Workflow:  a8984b09-566d-47ba-b6c5-fbe482d8ad7f 
```

The template ID is `75ab8483-6f42-42a9-a80d-a9f6196130df`. The MAC address of the Worker is `08:00:27:00:00:01`, which should match the MAC address of hardware data that you have already created to identify describe that Worker. It is mapped to `device_1`, which is where the MAC address will be substituted into the template when the workflow is created.

The command returns a workflow ID. The workflow is stored in the database on the Provisioner.

After creating a workflow, you can retrieve it from the database by ID with [`tink workflow get`](/cli-reference/workflow/#tink-workflow-get). You can list all the workflows stored in the database with [`tink workflow list`](/cli-reference/workflow/#tink-workflow-list). Delete a workflow with [`tink workflow delete`](/cli-reference/workflow/#tink-workflow-delete).

## Workflow Execution
 
On the first boot, the Worker is PXE booted, asks Boots for it's IP address, and loads into OSIE with light weight Alpine OS (and Docker -- ask Dan --) It then asks the `tink-server` for workflows that match its MAC or IP address. Those workflows are then executed onto the Worker.

![Architecture](/images/docs/ephemeral-data.png)

If there are no workflows defined for the Worker, the Provisioner will ignore the Worker's request. If as a part of the workflow, a new OS is installed and completes successfully, then the boot request (after reboot) will be handled by newly installed OS. If as a part of the workflow, an OS is not installed then worker after reboot will request PXE-boot from the Provisioner. 

You can view the events and the state of a workflow during or after it's execution with the tink CLI using the [`tink workflow events`](/cli-reference/workflow/#tink-workflow-events) an the [`tink workflow state`](/cli-reference/workflow/#tink-workflow-state) commands.

## Ephemeral Data

The workers that are part of a workflow might need to share data. This can take the form of a light JSON like below, or some binary files that other workers might require to complete their action.
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

Ephemeral data is passed as a file that is stored in the database that is accessed and modified in the execution of the workflow. You can get the ephemeral data associated with a workflow with the [`tink workflow data`](/cli-reference/workflow/#tink-workflow-data) tink CLI command. 
