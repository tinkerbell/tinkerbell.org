---
title: "Cloud-init"
draft: false
geekdocDescription: "Learn how to integrate Tinkerbell and Cloud-init."
---

_"Cloud images are operating system templates and every instance starts out as an identical clone of every other instance. It is the user data that gives every cloud instance its personality and cloud-init is the tool that applies user data to your instances automatically."_ - [cloud-init]

Tinkerbell via [Tootles] supports a good portion of the `2009-04-04` version of the EC2 API version for metadata and user data. This allows you to use Tootles to provide cloud-init data to your machines. See the [Tootles] doc for more details. This document will guide you through the process of integrating Tinkerbell and cloud-init. For details on how to use cloud-init, refer to the [cloud-init documentation].

## Defining data

There are two types of data that you can provide to your machines using cloud-init; metadata and user data. Both of these are defined in a machine's [Hardware] object.

### Metadata

Metadata is defined in the [Hardware] object under two locations. The `spec.metadata.instance` and `spec.metadata.facility` fields.

For the `v1alpha1` spec the following fields are supported under `spec.metadata.instance`:

| Hardware field | cloud-init field | Description |
| -------------- | ---------------- | ----------- |
| `id`           | `instance-id`    | The unique identifier for the instance. |
| `hostname`     | `hostname`       | The hostname of the instance. |
| `hostname`     | `local-hostname` | The local hostname of the instance. |
| `tags`         | `tags`           | The tags associated with the instance. |

For the `v1alpha1` spec the following fields are supported under `spec.metadata.instance.ips` (only the last IP is used):

| Hardware field | cloud-init field | Description |
| -------------- | ---------------- | ----------- |
| `address`   | `public-ipv4`    | The public IPv4 address of the instance. |
| `address`   | `public-ipv6`    | The public IPv6 address of the instance. |
| `address`   | `local-ipv4`     | The local IPv4 address of the instance. |

For the `v1alpha1` spec the following fields are supported under `spec.metadata.instance.operating_system`:

| Hardware field | cloud-init field | Description |
| -------------- | ---------------- | ----------- |
| `slug` | `slug` | The slug of the operating system. |
| `distro` | `distro` | The distribution of the operating system. |
| `version` | `version` | The version of the operating system. |
| `image_tag` | `image_tag` | The image of the operating system. |

For the `v1alpha1` spec the following fields are supported under `spec.metadata.facility`:

| Hardware field | cloud-init field | Description |
| -------------- | ---------------- | ----------- |
| `plan_slug`         | `plan`           | The plan of the instance. |
| `facility_code`     | `facility`       | The facility where the instance is located. |

### User data

User data is defined in the [Hardware] object under the `spec.userData` field. This field is a string that contains all the user data that you want to provide to your machine.

## Example

Here is an example of a [Hardware] object that contains metadata and user data for cloud-init. This is an example only and not a recommended configuration for production use.

```yaml
apiVersion: tinkerbell.org/v1alpha1
kind: Hardware
metadata:
  name: example
  namespace: tinkerbell
spec:
  userData: >-
    #cloud-config

    package_update: true

    users:
      - name: tink
        sudo: ['ALL=(ALL) NOPASSWD:ALL']
        shell: /bin/bash
        plain_text_passwd: 'tink'
        lock_passwd: false
        ssh_authorized_keys:
          - ssh-rsa AAAAB3Nza...iYTw==
    packages:
      - openssl
    runcmd:
      - sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
      - systemctl enable ssh.service
      - systemctl start ssh.service
      - systemctl disable snapd
      - rm -f /etc/hostname
  metadata:
    facility:
      facility_code: dia
      plan_slug: c2.medium.x86
    instance:
      hostname: example
      id: 00:01:02:03:04:05
      ips:
        - address: 192.168.2.3
      tags:
        - tag1
        - tag2
      operating_system:
        distro: ubuntu
        image_tag: latest
        slug: ubuntu_22_04
        version: "22.04"
```

## Setup cloud-init to use Tootles

To use cloud-init with Tinkerbell, you need to set up cloud-init to use Tootles as the configuration source. This is done via [Actions] in a [Template]. When using these example Actions, be sure to replace `<Tootles_IP:Port>` with the IP address and port of your Tootles instance.

> Please note that this is a known working configuration but not necessarily the only way to configure cloud-init to use Tootles.

```yaml
- name: "add cloud-init config"
  image: quay.io/tinkerbell/actions/writefile:latest
  timeout: 90
  environment:
    CONTENTS: |
      datasource:
        Ec2:
          metadata_urls: ["http://<Tootles_IP:Port>"]
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
- name: "add cloud-init ds-identity"
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
```

[Tootles]: /docs/services/tootles
[cloud-init]: https://cloud-init.io/
[cloud-init documentation]: https://cloudinit.readthedocs.io/en/latest/explanation/introduction.html
[Hardware]: /docs/concepts/hardware
[Actions]: /docs/concepts/templates/#actions
[Template]: /docs/concepts/templates
