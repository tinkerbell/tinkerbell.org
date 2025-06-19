---
type: "section-2"
title: "How Does it Work?"
image: "images/table-art.png"
hidden: true
---

Tinkerbell has a few core components: a DHCP server ([Smee](/docs/services/smee/)), a metadata service ([Tootles](/docs/services/tootles/)), an in-memory operating system installation environment ([HookOS](/docs/additionalcomponents/hookos/)) and a workflow engine ([Tink Server](/docs/services/tink-server/)/[Tink Worker](/docs/services/tink-worker/)).
The workflow engine is comprised of a controller, server and worker. The server and agent communicate over gRPC.
`kubectl` is used to create workflows along with hardware and template objects.
There are also a few optional components: 2 Power and Boot services ([PBnJ](/docs/services/pbnj/) and [Rufio](/docs/services/rufio/)) that communicate with BMCs. A Cluster API provider ([CAPT](/docs/services/cluster-api-provider-tinkerbell/)) for provisioning and managing Kubernetes clusters.
