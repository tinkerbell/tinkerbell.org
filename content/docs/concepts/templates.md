---
title: 'Templates'
draft: false
weight: 20
geekdocDescription: 'The resource that describes the collection of tasks and actions.'
---

A Template is a collection of tasks that are executed sequentially. Each Task is a collection of actions that are executed sequentially on a specific worker. Actions are the individual unit of work, such as streaming an image to a disk, writing a file, or partitioning a disk.

Templates are specified as a Kubernetes custom resource definition ([CRD]).

```yaml
apiVersion: tinkerbell.org/v1alpha1
kind: Template
metadata:
  name: ubuntu
  namespace: tinkerbell
spec:
  data: ""
```

## Tasks

While the `spec.data` field in the Template CRD is of type string, it has an expected data structure. This structure is defined in the [workflow](/docs/concepts/workflows) spec under the `status` field. It's structure is as follows:

```yaml
name: ""
version: "0.1"
global_timeout: 3600
tasks: []
```

- name `string`: A string that describes the template. It must be a string > 0 and < 200 characters. It should be unique among Tasks in the Template. Required.
- version `string`: A string that describes the version of the template. It must be "0.1". Note that it is deprecated and not used in the implementation. Required.
- global_timeout `int`: An integer that describes the global timeout in seconds for the template.
- tasks `[]task`: A list of task objects. Required.

The Go struct for Tasks is found [here]({{< repo_tree "api/v1alpha1/tinkerbell/workflow.go" >}}).

## Task

A Task describes a list of actions. A Task can define volumes and environment variables that will be available to all action containers. Multiple Tasks can be defined. Each Task can define a worker to run on. The same worker can be used for multiple tasks. Task names must be unique within a template.

```yaml
tasks:
- name: "installation"
  environment:
    GLOBAL_VALUE: "my global value"
  volumes:
  - /dev:/dev
  - /lib/firmware:/lib/firmware:ro
  worker: "{{.device_1}}"
  actions: []
- name: "post installation"
  environment:
    GLOBAL_VALUE: "my global value"
  volumes:
  - /dev:/dev
  - /lib/firmware:/lib/firmware:ro
  worker: "{{.device_2}}"
  actions: []
```

- name `string`: A string that describes the task. It should be unique among tasks in the template. Required.
- worker `string`: A string that is a Go template value that is used to match a worker. Required.
- volumes `[]string`: A list of strings that are used to mount volumes into all action containers. The format for each string should be `source:destination`.
- environment `map[string]string`: A map of strings that are used to set environment variables in all action containers.
- actions `[]action`: A list of actions that are executed sequentially. Required.

## Actions

Actions are the list of Action objects to be executed. Action objects will be executed sequentially at runtime and are all executed on the worker specified in the Task.

```yaml
actions:
  - environment:
      COMPRESSED: "true"
      DEST_DISK: /dev/vda
      IMG_URL: http://192.168.2.112:8080/jammy-server-cloudimg-amd64.raw.gz
    image: quay.io/tinkerbell/actions/image2disk:latest
    name: stream ubuntu image
    timeout: 9600
  - environment:
      CONTENTS: |
        datasource:
          Ec2:
            metadata_urls: ["http://192.168.2.112:50061"]
            strict_id: false
        manage_etc_hosts: localhost
        warnings:
          dsid_missing_source: off
      DEST_DISK: /dev/vda1
      DEST_PATH: /etc/cloud/cloud.cfg.d/10_tinkerbell.cfg
      DIRMODE: "0700"
      FS_TYPE: ext4
      GID: "0"
      MODE: "0600"
      UID: "0"
    image: quay.io/tinkerbell/actions/writefile:latest
    name: add-cloud-init-config
    timeout: 90
  - environment:
      CONTENTS: |
        datasource: Ec2
      DEST_DISK: /dev/vda1
      DEST_PATH: /etc/cloud/ds-identify.cfg
      DIRMODE: "0700"
      FS_TYPE: ext4
      GID: "0"
      MODE: "0600"
      UID: "0"
    image: quay.io/tinkerbell/actions/writefile:latest
    name: add-tink-cloud-init-ds-config
    timeout: 90
  - image: quay.io/tinkerbell/actions/writefile:latest
    name: write-netplan
    timeout: 90
```

## Action

An Action is an individual units of work, such as streaming an image to a disk, writing a file, or partitioning a disk.

```yaml
name: stream ubuntu image
image: quay.io/tinkerbell/actions/image2disk:latest
timeout: 9600
command: ["arguments", "used", "in", "container", "run", "here"]
on-timeout: ["echo", "timeout"]
on-failure: ["echo", "failure"]
volumes: ["/var/run/data":"/data"]
pid: "host"
environment:
  COMPRESSED: "true"
  DEST_DISK: /dev/vda
  IMG_URL: http://192.168.2.112:8080/jammy-server-cloudimg-amd64.raw.gz
```

- name `string`: A string that describes the action. It should be unique among actions in the task. Required.
- image `string`: A string that describes the fully qualified location to a container image to be used for the action. Required.
- timeout `int`: An integer that describes the timeout in seconds for the action.
- command `[]string`: A list of strings that are used as arguments when running the Action container.
- volumes `[]string`: A list of strings that are used to mount volumes into the action container. The format for each string should be `source:destination`.
- pid `string`: A string that describes the pid mode for the action. Generally it is either "host" or not defined.
- environment `map[string]string`: A map of strings that are used to set environment variables in the action container.

> **Note**: Actions are user-defined and can be any container image that is available to the worker.
> The Actions you see in this doc are examples and are not the only way to accomplish these tasks.
> See this [Actions repo] for the Tinkerbell maintained Actions.

## Full example

This is a full example of a Template for installing Ubuntu and configuring it to use cloud-init.

The `.artifact_server_ip_port` and `.tootles_ip_port` variables are assumed to
be set to the `IP:port` combinations of the artifact server housing the
Ubuntu image and the Tootles instance respectively.

```yaml
apiVersion: tinkerbell.org/v1alpha1
kind: Template
metadata:
  name: ubuntu
  namespace: tinkerbell
spec:
  data: |
    name: ubuntu
    version: "0.1"
    global_timeout: 9800
    tasks:
      - name: "os installation"
        worker: "{{.device_1}}"
        volumes:
          - /dev:/dev
          - /dev/console:/dev/console
          - /lib/firmware:/lib/firmware:ro
        environment:
          GLOBAL_VALUE: "my global value"
        actions:
          - name: "stream image"
            image: quay.io/tinkerbell/actions/image2disk:latest
            timeout: 9600
            environment:
              DEST_DISK: {{ index .Hardware.Disks 0 }}
              IMG_URL: "http://{{ .artifact_server_ip_port }}/jammy-server-cloudimg-amd64.raw.gz"
              COMPRESSED: true
          - name: "add cloud init config"
            image: quay.io/tinkerbell/actions/writefile:latest
            timeout: 90
            environment:
              CONTENTS: |
                datasource:
                  Ec2:
                    metadata_urls: ["http://{{ .tootles_ip_port }}"]
                    strict_id: false
                manage_etc_hosts: localhost
                warnings:
                  dsid_missing_source: off
              DEST_DISK: {{ formatPartition ( index .Hardware.Disks 0 ) 1 }}
              DEST_PATH: /etc/cloud/cloud.cfg.d/10_tinkerbell.cfg
              DIRMODE: "0700"
              FS_TYPE: ext4
              GID: "0"
              MODE: "0600"
              UID: "0"
          - name: "add cloud-init ds config"
            image: quay.io/tinkerbell/actions/writefile:latest
            timeout: 90
            environment:
              DEST_DISK: {{ formatPartition ( index .Hardware.Disks 0 ) 1 }}
              FS_TYPE: ext4
              DEST_PATH: /etc/cloud/ds-identify.cfg
              UID: 0
              GID: 0
              MODE: 0600
              DIRMODE: 0700
              CONTENTS: |
                datasource: Ec2
          - name: "write netplan"
            image: quay.io/tinkerbell/actions/writefile:latest
            timeout: 90
            environment:
              DEST_DISK: {{ formatPartition ( index .Hardware.Disks 0 ) 1 }}
              FS_TYPE: ext4
              DEST_PATH: /etc/netplan/config.yaml
              CONTENTS: |
                network:
                  version: 2
                  renderer: networkd
                  ethernets:
                    id0:
                      match:
                        name: en*
                      dhcp4: true
              UID: 0
              GID: 0
              MODE: 0644
              DIRMODE: 0755
```

## Templating a Template

A Template spec can contain Go template values, for example `{{ .device_1 }}`. The values come from a workflow spec that references the Template. For example, given the following template and workflow, the `{{ .device_1 }}` in the Template will be evaluated to `02:00:00:00:00:01` as defined in the Workflow spec at `spec.hardwareMap.device_1`. The `spec.hardwareMap` in the Workflow takes arbitrary key/value pairs.

```yaml
apiVersion: tinkerbell.org/v1alpha1
kind: Template
metadata:
  name: ubuntu
  namespace: tinkerbell
spec:
  data: |
    name: ubuntu
    version: "0.1"
    global_timeout: 9800
    tasks:
      - name: "os installation"
        worker: "{{.device_1}}"
        volumes:
          - /dev:/dev
        actions:
          - name: "stream image"
            image: quay.io/tinkerbell/actions/image2disk:latest
            timeout: 9600
            environment:
              DEST_DISK: {{ index .Hardware.Disks 0 }}
              IMG_URL: "http://{{ .artifact_server_ip_port }}/jammy-server-cloudimg-amd64.raw.gz"
              COMPRESSED: true
```

```yaml
apiVersion: tinkerbell.org/v1alpha1
kind: Workflow
metadata:
  name: ubuntu-install
  namespace: tinkerbell
spec:
  templateRef: ubuntu
  hardwareRef: hardware-1
  hardwareMap:
    device_1: 02:00:00:00:00:01
```

> **Note**:
> If the Template is defined as part of a Helm chart, you will need to escape the Go templates to make sure that Helm doesn't try to instantiate the template. One way to do so would be the following:
>
> ```yaml
>  worker: "{{ `{{.device_1}}` }}"
>  ```

### Available template arguments

Key names that are defined by a User in the Workflow spec at `spec.hardwareMap`:

| source            | output              |
|-------------------|---------------------|
| `{{ .device_1 }}` | `02:00:00:00:00:01` |
| `{{ .key_name }}` | `value`             |

The following values from the [Hardware Spec]({{< repo_tree "api/v1alpha1/tinkerbell/hardware.go#L47" >}})
can also be used:

- Interfaces
- Metadata
- Disks
- UserData
- VendorData

| source                                          | output                       |
|-------------------------------------------------|------------------------------|
| `{{ .Hardware.Disks }}`                         | `[ /dev/nvme0n1, /dev/sda ]` |
| `{{ (index .Hardware.Interfaces 0).DHCP.MAC }}` | `02:aa:ff:00:00:01`          |
| `{{ .Hardware.UserData }}`                      | `#cloud-config [...]`        |

### Available template functions

[Standard Go template functions]:

| source                                      | output              |
|---------------------------------------------|---------------------|
| `{{ .device_1 \| printf "%s" }}`            | `02:00:00:00:00:01` |
| `{{ if eq .device_1 "02:00:00:00:00:01" }}` | `true`              |
| `{{ index .Hardware.Disks 0 }}`             | `/dev/nvme0n1`      |

[Tinkerbell custom functions]:

| source                                                | output           |
|-------------------------------------------------------|------------------|
| `{{ formatPartition ( index .Hardware.Disks 0 ) 1 }}` | `/dev/nvme0n1p1` |

The functions from the [Sprig templating library](https://masterminds.github.io/sprig/)
can also be used:

| source                                           | output                 |
|--------------------------------------------------|------------------------|
| `{{ "filename with spaces" \| replace " " "-" }}` | `filename-with-spaces` |

## Other Resources

### v1alpha1 Spec

- [Template Kubernetes CRD]
- [Template Go struct definition]
- [Explorable Template Spec]
- [Task Go struct definition]
- [Workflow Kubernetes CRD]

### Services that use the Template spec

- [Tink Controller]

[CRD]: <https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/>
[Standard Go template functions]: <https://golang.org/pkg/text/template/>
[Tinkerbell custom functions]: {{< repo_tree "tink/controller/internal/workflow/template_funcs.go" >}}
[Template Kubernetes CRD]: {{< repo_tree "crd/bases/tinkerbell.org_templates.yaml" >}}
[Template Go struct definition]: {{< repo_tree "api/v1alpha1/tinkerbell/template.go#L36" >}}
[Explorable Template Spec]: https://doc.crds.dev/github.com/tinkerbell/tinkerbell/tinkerbell.org/Hardware/v1alpha1@{{< tinkerbell_version >}}
[Task Go struct definition]: {{< repo_tree "api/v1alpha1/tinkerbell/workflow.go#L208" >}}
[Workflow Kubernetes CRD]: {{< repo_tree "crd/bases/tinkerbell.org_workflows.yaml" >}}
[Tink Controller]: /docs/services/tink-controller
[Actions repo]: <https://github.com/tinkerbell/actions>
