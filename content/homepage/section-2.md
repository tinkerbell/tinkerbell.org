+++
type = "section-2"
title = "How Does it Work?"
image = "/images/table-art.png"
hidden = true
+++

Tinkerbell has four major components: a DHCP server (Boots), a metadata service (Hegel), an in-memory operating system installation environment (Hook) and a workflow engine (Tink).
There is also an optional fifth component useful in VM and server setups: a Power and Boot service (PBnJ) that communicates with BMCs.
The workflow engine is comprised of a server and a CLI, which communicate over gRPC.
The CLI is used to create a workflow along with its building blocks, templates and targets.
