+++
title = "Workflow"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 40
toc = true
+++

Workflow operations.

### Synopsis

Workflow operations:

```
  create      create a workflow
  data        get workflow data
  delete      delete a workflow
  events      show all events for a workflow
  get         get a workflow
  list        list all workflows
  state       get the current workflow context
```

### Options

```
  -h, --help   help for workflow
```

### Examples

- Create a workflow using a template and a targeted hardware devices

```shell
 $ tink workflow create -t <template-uuid> -r <targeted_hardware_devices_in_json_format>
 $ tink workflow create -t edb80a56-b1f2-4502-abf9-17326324192b -r '{"device_1":"mac/IP", "device_2":"mac/IP"}'
```

{{% notice note %}}
The key used in the above command which is _device_1_ should be in sync with _worker_ field in the _template_ and can only contain _letters_, _numbers_ and _underscores_.
Click [here](/concepts/) to check the template structure.
{{% /notice %}}
