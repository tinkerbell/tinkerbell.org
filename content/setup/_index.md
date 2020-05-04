+++
title = "Setup"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 10
toc = true
+++

This guide will help you in setting up a minimal system of two machines, a provisioner and a worker, as well as run a sample workflow that will display a simple hello world.

Below are brief descriptions of the roles each of the machines play in the system:

#### Provisioner
- Acts as the DHCP server
- Keeps track of all the workflows
- Hosts any files necessary for the workflows to execute

#### Worker
- Is the machine that is being acted on
- Asks the provisioner for available workflows
- Executes the ones specified for itself

#### Steps
1. [Create Servers](/setup/create_servers/)
2. [Prepare the Provisioner](/setup/prep_provisioner/)
3. [Setup Action Images](/setup/action_images/)
4. [Workflows](/setup/workflows/)

{{% notice note %}}
It is important to note that you can run any workflow using this setup, but the purpose of this sample is to allow you to get a sense of how things work at a basic level.
{{% /notice %}}
