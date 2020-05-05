---
id: section-2
title: How Does it Work?
image: ../../images/table-art.png
---

Tinkerbell has three major components: a DHCP server (boots), a workflow engine (tinkerbell), and a metadata service (hegel). The workflow engine is comprised of a server and a CLI, which communicate over gRPC. The CLI is used to create a workflow along with its building blocks, templates and targets.
