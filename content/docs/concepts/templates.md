---
title: 'Templates'
draft: false
weight: 20
geekdocDescription: 'The resource that describes the collection of tasks and actions.'
---

A Template is a collection of tasks that are executed sequentially. Each Task is a collection of actions that are executed sequentially on a specific worker. Actions are the individual unit of work, such as streaming an image to a disk, writing a file, or partitioning a disk.

Templates are specified as a Kubernetes [custom resource definition].

```yaml
apiVersion: tinkerbell.org/v1alpha1
kind: Template
metadata:
  name: ubuntu
  namespace: tink-system
spec:
  data: ""
```

The Template CRD is found [here](https://github.com/tinkerbell/tink/blob/01818192d62a5657b72eac2e205fd6dc1ec8e5b6/config/crd/bases/tinkerbell.org_templates.yaml) and the corresponding Go struct definition is found [here](https://github.com/tinkerbell/tink/blob/01818192d62a5657b72eac2e205fd6dc1ec8e5b6/api/v1alpha1/template_types.go#L36).

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

The Go struct for a Task is found [here](https://github.com/tinkerbell/tink/blob/01818192d62a5657b72eac2e205fd6dc1ec8e5b6/api/v1alpha1/workflow_types.go#L42) and the Kubernetes custom resource definition [here](https://github.com/tinkerbell/tink/blob/01818192d62a5657b72eac2e205fd6dc1ec8e5b6/config/crd/bases/tinkerbell.org_workflows.yaml). The spec can also be explored [here](https://doc.crds.dev/github.com/tinkerbell/tink/tinkerbell.org/Workflow/v1alpha1#status-tasks).

## Actions

Actions are the list of Action objects to be executed. Action objects will be executed sequentially at runtime and are all executed on the worker specified in the Task.

```yaml
actions:
  - environment:
      COMPRESSED: "true"
      DEST_DISK: /dev/vda
      IMG_URL: http://192.168.2.112:8080/jammy-server-cloudimg-amd64.raw.gz
    image: quay.io/tinkerbell-actions/image2disk:v1.0.0
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
    image: quay.io/tinkerbell-actions/writefile:v1.0.0
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
    image: quay.io/tinkerbell-actions/writefile:v1.0.0
    name: add-tink-cloud-init-ds-config
    timeout: 90
  - image: quay.io/tinkerbell-actions/writefile:v1.0.0
    name: write-netplan
    timeout: 90
```

## Action

An Action is an individual units of work, such as streaming an image to a disk, writing a file, or partitioning a disk.

```yaml
name: stream ubuntu image
image: quay.io/tinkerbell-actions/image2disk:v1.0.0
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
            image: quay.io/tinkerbell-actions/image2disk:v1.0.0
            timeout: 9600
            environment:
              DEST_DISK: {{ index .Hardware.Disks 0 }}
              IMG_URL: "http://{{ .artifact_server_ip_port }}/jammy-server-cloudimg-amd64.raw.gz"
              COMPRESSED: true
          - name: "add cloud init config"
            image: quay.io/tinkerbell-actions/writefile:v1.0.0
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
            image: quay.io/tinkerbell-actions/writefile:v1.0.0
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
            image: quay.io/tinkerbell-actions/writefile:v1.0.0
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

A Template spec can contain Go template values, for example `{{ .device_1 }}`. Any top level field, like `{{ .device_1 }}`, will be replaced with the corresponding field value defined in the [Workflow spec](/docs/concepts/workflows). See the [Workflow doc](/docs/concepts/workflows) for more information. Along with the default Go template functions there are some custom functions available: https://github.com/tinkerbell/tink/blob/v0.10.0/internal/workflow/template_funcs.go (`contains`, `hasPrefix`, `hasSuffix`, and `formatPartition`)
There is some data from the Hardware spec that is also available for use, disk devices for example.


## Notes

- More info on the specific areas of the spec can be found in the following docs:
  Actions - [here](/docs/concepts/actions)

- where does the spec live?  
  Current version is v1alpha1

- Which services use the spec?  
  Tink controller - Uses the spec to match a worker with a template.

[custom resource definition]: https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/