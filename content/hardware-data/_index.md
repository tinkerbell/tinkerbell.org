+++
title = "Hardware Data"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 50
toc = true
+++


 - Hardware data holds the details about the hardware that you wish to use with a workflow.
 - A hardware may have multiple network devices that can be used in a worklfow.
 - The details about all those devices is maintained in JSON format as hardware data.

### Example

If you have a hardware that has a single network/worker device on it, its hardware data shall be structured like the following:

```json
{
  "id": "8978e7d4-1a55-4845-8a66-a5259236b104",
  "arch": "x86_64",
  "name": "node-name",
  "state": "provisioning",
  "allow_pxe": true,
  "allow_workflow": true,
  "plan_slug": "t1.small.x86",
  "facility_code": "onprem",
  "instance": {
    "storage": {
      "disks": [
        {
          "device": "/dev/sda",
          "wipeTable": true,
          "partitions": [
            {
              "size": 4096,
              "label": "BIOS",
              "number": 1
            },
            {
              "size": "3993600",
              "label": "SWAP",
              "number": 2
            },
            {
              "size": 0,
              "label": "ROOT",
              "number": 3
            }
          ]
        }
      ],
      "filesystems": [
        {
          "mount": {
            "point": "/",
            "create": {
              "options": [
                "-L",
                "ROOT"
              ]
            },
            "device": "/dev/sda3",
            "format": "ext4"
          }
        },
        {
          "mount": {
            "point": "none",
            "create": {
              "options": [
                "-L",
                "SWAP"
              ]
            },
            "device": "/dev/sda2",
            "format": "swap"
          }
        }
      ]
    },
    "crypted_root_password": "$6$qViImWbWFfH/a4pq$s1bpFFXMpQj1eQbHWsruLy6/",
    "operating_system_version": {
      "distro": "ubuntu",
      "version": "16.04",
      "os_slug": "ubuntu_16_04",
    }
  },
  "ip_addresses": [
    {
      "cidr": 31,
      "public": false,
      "address": "172.16.1.35",
      "enabled": true,
      "gateway": "172.16.1.34",
      "netmask": "255.255.255.254",
      "network": "172.16.1.34",
      "address_family": 4
    }
  ],
  "network_ports": [
    {
      "data": {
        "mac": "98:03:9b:48:de:bc"
      },
      "name": "eth0",
      "type": "data"
    }
  ]
}
```

### Property Description

The following section explains each property in the above example:

|  Property | Description |
|-----------|-------------|
|id         |A UUID used to uniquely identify the hardware. The `id` can be generated using the `uuidgen` command. If you are in Packet environment, you can get the `id` from the server overview page.|
|arch       |The hardware architecture. Example: `x86_64`.|
|name       |Name of the worker node.|
|state      |The state must be set to `provisioning` for workflows.|
|allow_pxe  |Must be set to `true` to PXE.|
|allow_workflow|Must be `true` in order to execute a workflow.|
|facility_code|For local setup, `onprem` or any other string value can be used.|
|plan_slug|The slug for the worker class. The value for this property depends on how you setup your workflow. While it is required if you are using the OS images from [packet-images](https://github.com/packethost/packet-images) repository, it may be left out if not used at all in the workflow.|
|instance|Holds the details for an instance.|
|instance.storage|Details for an instance storage like disks and filesystems.|
|instance.storage.disks|List of disk partitions.|
|instance.storage.disks[].device|Name of the disk.|
|instance.storage.disks[].wipeTable|Set to `true` to allow disk wipe.|
|instance.storage.disks[].partitions|List of disk partitions.|
|instance.storage.disks[].partitions[].size|Size of the partition .|
|instance.storage.disks[].partitions[].label|Partition label like BIOS, SWAP or ROOT.|
|instance.storage.disks[].partitions[].number|The partition number.|
|instance.storage.filesystems|List of filesystems and their respective mount points.|
|instance.storage.filesystems[].mount|Details about the filesystem to be mounted.|
|instance.storage.filesystems[].mount.point|Mount point for the filesystem.|
|instance.storage.filesystems[].mount.create|Additional details that can be provided while creating a partition.|
|instance.storage.filesystems[].mount.create.options|Options to be passed to `mkfs` while creating a partition.|
|instance.storage.filesystems[].mount.device|The device to be mounted.|
|instance.storage.filesystems[].mount.format|The filesystem format.|
|crypted_root_password|The hash for root password that is used to login into the worker after provisioning. The hash can be generated using the `openssl passwd` command. For example, `openssl passwd -6 -salt xyz your-password`.|
|operating_system_version|Details about the operating system to be installed.|
|operating_system_version.distro|Operating system distribution name like ubuntu.|
|operating_system_version.version|Operating system version like 18.04 or 20.04.|
|operating_system_version.os_slug|A slug is a combination of operating system distro and version.|
|ip_addresses|Details for DHCP.|
|ip_addresses[].cidr|The newtwork CIDR.|
|ip_addresses[].public|`false` as the worker will should be in private network.|
|ip_addresses[].address|The worker IP address to be requested over DHCP.|
|ip_addresses[].enabled|Must be set to `true`.|
|ip_addresses[].gateway|The gateway address.|
|ip_addresses[].netmask|Netmask for the private network.|
|ip_addresses[].address_family|Should be set to 4 for IPv4 and 6 for IPv6.|
|network_ports|List of network devices (workers) on the hardware.|
|network_ports[].data.mac|MAC address of the network device (worker).|
|network_ports[].name|It must set to `eth0` for a worker node.|
|network_ports[].type|Set as `data`.|

### The Minimal Hardware Data

While the hardware data is essential, not all the properties are required for every workflow.
In fact, it's upto a workflow designer how they want to use the data in their workflow.
Therefore, you may start with the minimal data given below and only add the properties you would want to use in your workflow.

```
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
