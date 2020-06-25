+++
title = "Architecture"
date = 2020-06-25
draft = false
weight = 30
toc = true
+++


![Architecture](/images/docs/workflow-architecture.png)

### Provisioner

The provisioner machine is the main driver for executing a workflow. The Provisioner houses the following components:

Tinkerbell
- Boots
- Hegel
- PBnJ
- Tink

Other administrative bits
- Database (PostgreSQL)
- Image Registry
- NGINX

You may divide these components into multiple servers that would then all function as your Provisioner. The Provisioner acts as the DHCP server, keeps track of all the Workflows, and hosts any files and necessary for the Workflows to execute.

### Worker

A worker machine is the machine that is being acted on. It asks the provisioner for available Workflows and executes the ones specified for its Hardware Data. Any node that has its data being pushed into Tinkerbell can become a part of a Workflow. A worker can be a part of multiple Workflows.
