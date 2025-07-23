---
title: "Tink Server"
draft: false
geekdocDescription: "A gRPC server for interacting with Tink workers."
---

Tink Server exposes workflow actions over a gRPC API for [Tink Worker] to retrieve and execute on a machine being provisioned. When a Tink worker completes an action, it reports the status back to the Tink Server and retrieves the next action, if any.
The Tink Server uses the [Workflow]({{< repo_tree "crd/bases/tinkerbell.org_workflows.yaml" >}}) Kubernetes resource, continuously updating the Status based on the Worker's reports.

The Tink Server <-> Worker communication protocol is implemented with [Protobuf](https://protobuf.dev/). The proto files can be found [here]({{< repo_tree "pkg/proto" >}}).

[tink worker]: /docs/services/tink-worker
