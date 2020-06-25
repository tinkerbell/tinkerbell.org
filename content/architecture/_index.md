+++
title = "Architecture"
date = 2020-06-25
draft = false
weight = 30
toc = true
+++


![Architecture](/images/docs/workflow-architecture.png)

### Provisioner


    Acts as the DHCP server
    Keeps track of all the workflows
    Hosts any files necessary for the workflows to execute

    The provisioner machine is the main driver for executing a workflow. A provisioner houses the following components:

    Database (Postgres)
    Tinkerbell (CLI and server)
    Boots
    Hegel
    PBnJ
    Image Registry
    NGINX

You may divide these components into multiple servers.

### Worker

    Is the machine that is being acted on
    Asks the provisioner for available workflows
    Executes the ones specified for itself

    A worker is targeted hardware on which a workflow needs to run.

Any node that has its data being pushed into Tinkerbell can become a part of a workflow. A worker can be a part of multiple workflows.

When the node boots, a worker container starts and connects with the provisioner to check if there is any task (may be from different workflows) that it can execute. After the completion of an action, the worker sends action status to provisioner. When all workflows which are related to a worker are complete, a worker can terminate.
