---
title: "Tink Controller"
draft: false
geekdocDescription: "Kubernetes controller for managing workflows."
---

Tink Controller is a Kubernetes controller for managing [Workflows](/docs/concepts/workflows).
It continuosly reconciles Workflows, checking for timeouts being reached as well
as new Workflows appearing.

For new Workflows, the Controller instantiates the referenced Template for the
referenced Hardware and puts the result in the Status of the Workflow.

The Controller also executes pre- and post-execution steps for Workflows, for
example setting the Hardware's netboot status or executing BMC actions.

The source code for the Controller can be found in the Tinkerbell repository
under the [`tink/controller/`]({{< repo_tree "tink/controller" >}}) directory.
