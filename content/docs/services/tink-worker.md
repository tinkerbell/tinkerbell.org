---
title: "Tink Worker"
draft: false
geekdocDescription: "An agent that is responsible for executing and reporting on workflows."
---

## Overview

Tink Worker is an agent that runs in the operating system installation environment.
It is responsible for retrieving [Workflow Actions](/docs/concepts/templates/#action) from [Tink Server] and executing them.
Actions are published as Docker containers with Tink Worker acting as their launcher.
When an action finishes, Tink Worker reports the status to [Tink Server]

### How Tink Worker starts

In [Hook], Tinkerbell's default operating system installation environment, Tink Worker is launched by a multi-staged process. A small program called [hook-bootkit] is launched as a serivce, reads the Kernel command line for Tink Worker specific parameters, then launches Tink Worker as a Docker container. See the [LinuxKit configuration file][hook-bootkit-service] and [documentation][linuxkit] for how [hook-bootkit] is launched.

[hook]: /docs/additionalcomponents/hookOS
[tink server]: /docs/services/tink-server
[hook-bootkit]: https://github.com/tinkerbell/hook/tree/main/images/hook-bootkit
[hook-bootkit-service]: https://github.com/tinkerbell/hook/blob/main/linuxkit-templates/hook.template.yaml#L190
[linuxkit]: https://github.com/linuxkit/linuxkit
