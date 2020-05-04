---
id: section-2
title: How Tinkerbell Works?
image: ../../images/table-art.png
---

Tinkerbell concepts are: <strong>Template</strong> (is a Go based template, a user must write definition that defines the overall flow of a workflow). <strong>Targets</strong> (are mapping between the virtual worker name and the actual host). <strong>Provisioner</strong> (is the main driver for executing a workflow). Worker (Any node that has its data being pushed into Tinkerbell can become a part of a workflow). <strong>Ephemeral Data</strong> (The workers that are part of a workflow might require to share some data, could be a light JSON or some binary files that other workers might require to complete their action).
