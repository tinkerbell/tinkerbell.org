---
title: 'Templates'
draft: false
weight: 20
geekdocDescription: 'The resource that describes the collection of tasks and actions.'
latestTinkVersion: "https://github.com/tinkerbell/tink/tree/v0.10.0"
---

A Template is a collection of tasks that are executed sequentially. Each Task is a collection of actions that are executed sequentially on a specific worker. Actions are the individual unit of work, such as streaming an image to a disk, writing a file, or partitioning a disk.

Templates are specified as a Kubernetes custom resource definition ([CRD]).

```yaml
apiVersion: tinkerbell.org/v1alpha1
kind: Template
metadata:
  name: ubuntu
  namespace: tink-system
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

The Go struct for Tasks is found [here](https://github.com/tinkerbell/tink/blob/01818192d62a5657b72eac2e205fd6dc1ec8e5b6/api/v1alpha1/workflow_types.go#L78) and the Kubernetes custom resource definition [here](https://github.com/tinkerbell/tink/blob/01818192d62a5657b72eac2e205fd6dc1ec8e5b6/config/crd/bases/tinkerbell.org_workflows.yaml#L64). The spec can also be explored [here](https://doc.crds.dev/github.com/tinkerbell/tink/tinkerbell.org/Workflow/v1alpha1#status).

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
command: ["echo", "override", "entrypoint", "in", "container", "image", "here"]
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
- command `[]string`: A list of strings that are used to override the entrypoint in the container image.
- on-timeout `[]string`: A list of strings that are used to override the entrypoint in the container image when the action times out.
- on-failure `[]string`: A list of strings that are used to override the entrypoint in the container image when the action fails.
- volumes `[]string`: A list of strings that are used to mount volumes into the action container. The format for each string should be `source:destination`.
- pid `string`: A string that describes the pid mode for the action. Generally it is either "host" or not defined.
- environment `map[string]string`: A map of strings that are used to set environment variables in the action container.

> **Note**: Actions are user-defined and can be any container image that is available to the worker.
> The Actions you see in this doc are examples and are not the only way to accomplish these tasks.
> See this [Actions repo] for the Tinkerbell maintained Actions.

## Full example

This is a full example of a Template for installing Ubuntu and configuring it to use cloud-init.

```yaml
apiVersion: tinkerbell.org/v1alpha1
kind: Template
metadata:
  name: ubuntu
  namespace: tink-system
spec:
  data: |
    name: ubuntu
    version: "1.0"
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
                    metadata_urls: ["http://{{ .hegel_ip_port }}"]
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
  namespace: tink-system
spec:
  data: |
    name: ubuntu
    version: "1.0"
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
  namespace: tink-system
spec:
  templateRef: ubuntu
  hardwareRef: hardware-1
  hardwareMap:
    device_1: 02:00:00:00:00:01
```

### Available template arguments

Key names that are defined by a User in the Workflow spec at `spec.hardwareMap`:

| source | output |
| ---    | ---    |
| `{{ .device_1 }}` | `02:00:00:00:00:01` |
| `{{ .key_name }}` | `value` |

Values from the Hardware spec (currently, only [Disks][Hardware data contract] are available):

| source | output |
| ---    | ---    |
| `{{ .Hardware.Disks }}` | `[ /dev/nvme0n1, /dev/sda ]` |

### Available template functions

[Standard Go template functions]:

| source | output |
| ---    | ---    |
| `{{ .device_1 \| printf "%s" }}`            | `02:00:00:00:00:01` |
| `{{ if eq .device_1 "02:00:00:00:00:01" }}` | `true` |
| `{{ index .Hardware.Disks 0 }}`             | `/dev/nvme0n1` |

[Tinkerbell custom functions]:

| source | output |
| ---    | ---    |
| `{{ formatPartition ( index .Hardware.Disks 0 ) 1 }}` | `/dev/nvme0n1p1` |
| `{{ contains .device_1 "02:00:00:00:00:01" }}`        | `true` |
| `{{ hasPrefix .device_1 "02:00:00" }}`                | `true` |
| `{{ hasSuffix .device_1 "00:01" }}`                   | `true` |

## Other Resources

### v1alpha1 Spec

- [Template Kubernetes CRD]
- [Template Go struct definition]
- [Explorable Template Spec]
- [Task Go struct definition]
- [Explorable Task Spec]
- [Workflow Kubernetes CRD]

### Services that use the Template spec

- [Tink Controller]

[CRD]: <https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/>
[latest Tink version]: {{< stringparam "latestTinkVersion" >}}
[Standard Go template functions]: <https://golang.org/pkg/text/template/>
[Tinkerbell custom functions]: {{< stringparam "latestTinkVersion" >}}/internal/workflow/template_funcs.go#L9
[Hardware data contract]: {{< stringparam "latestTinkVersion" >}}/internal/workflow/reconciler.go#L127-L140
[Template Kubernetes CRD]: {{< stringparam "latestTinkVersion" >}}/config/crd/bases/tinkerbell.org_templates.yaml
[Template Go struct definition]: {{< stringparam "latestTinkVersion" >}}/api/v1alpha1/template_types.go#L36
[Explorable Template Spec]: <https://doc.crds.dev/github.com/tinkerbell/tink/tinkerbell.org/Template/v1alpha1>
[Task Go struct definition]: {{< stringparam "latestTinkVersion" >}}/api/v1alpha1/workflow_types.go#L42
[Explorable Task Spec]: <https://doc.crds.dev/github.com/tinkerbell/tink/tinkerbell.org/Workflow/v1alpha1#status-tasks>
[Workflow Kubernetes CRD]: <{{< stringparam "latestTinkVersion" >}}/config/crd/bases/tinkerbell.org_workflows.yaml>
[Tink Controller]: /docs/services/tink-controller
[Actions repo]: <https://github.com/tinkerbell/actions>
