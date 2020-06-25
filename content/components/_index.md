+++
title = "The Tinkerbell Stack"
date = 2020-06-25
draft = false
weight = 10
toc = true
+++

### Boots

[Boots](https://github.com/tinkerbell/boots) is Tinkerbell's DHCP server. It handles DHCP requests, hands out IPs, and serves up iPXE.
It also uses the Tinkerbell client to pull and push hardware data.
`boots` will only respond to a predefined set of MAC addresses so it can be deployed in an existing network without interfering with existing DHCP infrastructure.

### Hegel

[Hegel](https://github.com/tinkerbell/hegel) is the metadata service used by Tinkerbell and OSIE during provisioning.
It collects data from Tinkerbell and transforms it into a JSON format to be consumed as metadata.

### OSIE

[OSIE]() installs operating systems and handles deprovisioning.

### PBnJ

[PBnJ]() communicates with BMCs to control power and boot settings.

### Tink

[Tink]() is the service responsible for processing workflows.
It is comprised of a server and a CLI, which communicate over gRPC.
The CLI is used to create a workflow along with its building blocks, i.e., a template and targeted hardware.

### Database

Tinkerbell uses [PostgreSQL](https://www.postgresql.org/) as its our data store. PostgreSQL is a free and open-source relational database management system that emphasizes extensibility and technical standards compliance. It is designed to handle a range of workloads, from single machines to data warehouses or Web services with many concurrent users.

### Image Repository

Depending on your use case, you can choose to use [Quay](https://quay.io/) or [DockerHub](https://hub.docker.com/) as the registry to store component images. You can use the same registry to store all of the action images used for a workflow. If you want to keep things local, you can also setup a secure private Docker registry to hold all your images locally.

### NGINX

[NGINX](https://www.nginx.com/) is a web server which can also be used as a reverse proxy, load balancer, mail proxy and HTTP cache.
Tinkerbell uses NGINX to serve the required boot files during a workflow execution.
