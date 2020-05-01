+++
title = "Create servers"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 20
toc = true
+++

### Using Terraform
Using Terraform (with the Packet provider), create two servers _tf-provisioner_ and _tf-worker_ attached to the same VLAN.

- Clone the *tink* repository locally and switch to the *demo-v2* branch:
```sh
$ git clone https://github.com/tinkerbell/tink.git
$ cd tink
$ git checkout demo-v2
$ cd demo/terraform
```

- Update the _<packet_api_token>_ and _<project_id>_ fields in _input.tf_ with your Packet API token and desired project ID
- You may also update the hostnames in _main.tf_ if you prefer names other than _tf-provisioner_ and _tf-worker_
- Run the following commands:
```sh
$ terraform init
$ terraform apply
```
*Note:* As an output, it returns the IP address of the provisioner and MAC address of the worker machine.

### Manual Setup
If you do not wish to use Terraform, you can provision the servers manually with the following configurations.

#### Provisioner
+ Plan: c3.small.x86 (or any plan that supports Layer 2)
+ OS: Ubuntu 18.04 LTS
+ After device is provisioned:
  - Convert network type to Mixed/Hybrid
  - Attach VLAN to interface eth1 (under Layer 2)

#### Worker
+ Facility: <same_as_provisioner>
+ Plan: c3.small.x86 (or any plan that supports Layer 2)
+ OS: Custom iPXE
  - IPXE Script URL: https://boot.netboot.xyz
  - Always/Persist PXE: true
+ After device is provisioned:
  - Convert network type to Layer 2 (individual)
  - Attach VLAN to interface eth0
  - Same VLAN as provisioner