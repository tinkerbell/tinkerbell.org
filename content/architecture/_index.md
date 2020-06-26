+++
title = "Architecture"
date = 2020-06-25
draft = false
weight = 30
toc = true
+++


![Architecture](/images/docs/workflow-architecture.png)

### Provisioner

The provisioner machine is the main driver for executing a workflow. The Provisioner houses and runs the [Tinkerbell stack](/compoents), acting as the DHCP server, keeps track of all the Workflows, and hosts any files and necessary for the Workflows to execute. You may divide these components into multiple servers that would then all function as your Provisioner. 

### Worker

A Worker machine is the target machine, identified by its hardware data, that calls back to the Provisioner and executes its specified Workflows. Any machine that has had its Hardware Data pushed into Tinkerbell can become a part of a Workflow. A Worker can be a part of multiple Workflows.
