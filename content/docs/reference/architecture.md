---
title: "Architecture"
draft: false
geekdocDescription: "Details on the architecture of the Tinkerbell stack."
---

## Tinkerbell Stack

The Tinkerbell stack acts as the DHCP server, keeps track of hardware, template, and workflow Custom resource objects.

### Stack Requirements

#### OS

The Tinkerbell stack has been tested on Kubernetes.

#### Minimum Resources

- CPU - 2vCPUs
- RAM - 4 GB
- Disk - 300MB

#### Network

L2 networking is required for the ability to run a DHCP server (in this case, Smee).

## Physical Machine

A physical machine is the machine, identified by its hardware object, that is the target of a workflow.

### Physical Machine Requirements

There are some very basic requirements that a Worker machine must meet in order to be able to boot and call back to the Provisioner.

- Must be able to network boot using iPXE.
- About 2 GB of RAM to be able to load HookOS into memory and run a workflow. The exact amount of RAM required will also depend the size of the action container images in your workflow.

There are no Disk requirements from the Tinkerbell stack side since HookOS runs in-memory.
Your disk requirements will be determined by the OS you are going to install and any other use-case considerations.
