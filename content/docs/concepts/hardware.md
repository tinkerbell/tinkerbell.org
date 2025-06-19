---
title: 'Hardware'
draft: false
geekdocDescription: "The resource that describes your physical machine."
weight: 10
---

The Hardware spec describes a physical machine. Its main purpose is for IP Address Management. Its current version is `v1alpha`. The v1alpha1 spec includes fields for specifying disk devices, cloudinit user data, and a few others. At installation time, it is deployed as a Kubernetes custom resource definition, `hardware.tinkerbell.org`. There are no required fields, but generally speaking and at a minimum you'll want IPAM data. This is specified at `spec.interfaces`. More info on the specific areas of the spec can be found in the following docs:

- Cloudinit - [here](/docs/integrations/cloudinit) and [here](/docs/services/tootles)
- DHCP and IPAM - [here](/docs/services/smee)
- Template Rendering - [here](/docs/services/tink-controller)

- where does the spec live?
    Current version is v1alpha1
    Go spec -> https://github.com/tinkerbell/tink/blob/main/api/v1alpha1/hardware_types.go
    Kubernetes Custom Resource Definition -> https://github.com/tinkerbell/tink/blob/main/config/crd/bases/tinkerbell.org_hardware.yaml
    Explorable Spec -> https://doc.crds.dev/github.com/tinkerbell/tink/tinkerbell.org/Hardware/v1alpha1

- Which services use the spec?
    Smee - Uses the IPAM fields for serving DHCP and gating of whether a machine should be given network boot info or not.
    Tink Controller - Uses the spec for template rendering of workflows.
    Tootles - Uses the spec for serving metadata.

## Example

```yaml
apiVersion: tinkerbell.org/v1alpha1
kind: Hardware
metadata:
  name: machine1
  namespace: tink-system
spec:
  disks:
  - device: /dev/sda
  interfaces:
  - dhcp:
      arch: x86_64
      hostname: machine1
      ip:
        address: 192.168.2.148
        gateway: 192.168.2.1
        netmask: 255.255.255.0
      lease_time: 86400
      mac: 52:54:00:0f:2e:67
      name_servers:
      - 1.1.1.1
      - 8.8.8.8
      uefi: true
    netboot:
      allowPXE: true
      allowWorkflow: true
```
