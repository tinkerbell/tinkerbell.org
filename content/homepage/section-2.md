---
type: "section-2"
title: "How Does it Work?"
image: "images/table-art.png"
hidden: true
---

Tinkerbell has a few core components: a DHCP server ([Smee](https://github.com/tinkerbell/smee)), a metadata service ([Tootles](https://github.com/tinkerbell/tinkerbell/tree/main/tootles)), an in-memory operating system installation environment ([HookOS](https://github.com/tinkerbell/hook)) and a workflow engine ([Tink Server/Worker](https://github.com/tinkerbell/tink)).
The workflow engine is comprised of a controller, server and worker. The server and agent communicate over gRPC.
`kubectl` is used to create workflows along with hardware and template objects.
There are also a few optional components: 2 Power and Boot services ([PBnJ](https://github.com/tinkerbell/pbnj) and [Rufio](https://github.com/tinkerbell/rufio)) that communicate with BMCs. A Cluster API provider ([CAPT](https://github.com/tinkerbell/cluster-api-provider-tinkerbell)) for provisioning and managing Kubernetes clusters.
