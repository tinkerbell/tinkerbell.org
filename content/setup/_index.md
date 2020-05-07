+++
title = "Setup"
date = 2020-05-07T16:16:15+05:30
draft = false
weight = 40
toc = true
+++

The setup guides will help you in setting up a minimal system of two machines: a provisioner and a worker.
This minimal setup is enough to get you started with workflows.

Below are brief descriptions of the roles each of the machines play in the system:

#### Provisioner
- Acts as the DHCP server
- Keeps track of all the workflows
- Hosts any files necessary for the workflows to execute

#### Worker
- Is the machine that is being acted on
- Asks the provisioner for available workflows
- Executes the ones specified for itself

Now, follow the steps for your environment:
 - [Packet](/setup/packet)
