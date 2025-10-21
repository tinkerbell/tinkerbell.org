---
title: 'Workflows'
draft: false
weight: 40
geekdocDescription: 'Workflows bring together Hardware and a Template for execution.'
---

A Workflow brings together [Hardware] and a [Template] for execution.

Workflows are specified as a Kubernetes custom resource definition (CRD) and are managed by [tink-controller].

```yaml
apiVersion: "tinkerbell.org/v1alpha1"
kind: Workflow
metadata:
  name: example
spec:
  templateRef: ubuntu
  hardwareRef: example-hardware
  hardwareMap:
    device_1: 00:00:00:00:00:01
    key: value
```

- `templateRef` is the name of the [Template] to use. Required.
- `hardwareRef` is the name of the [Hardware] to use. Optional.
- `hardwareMap` is a map of key-value pairs that are passed to the [Template] as environment variables.

## hardwareMap

The `hardwareMap` field is a map of User defined key-value pairs that can be referenced in a [Template]. Normally, one of these key-value pairs is used to specify a worker ID in the Template. This value is normally the MAC address of the NIC (network interface card) that the worker will use to network boot. `hardwareMap` does not support nested objects.

## Workflow State

The status of a Workflow is updated by the [tink-controller]. Tink-controller will initially render the Template from `templateRef` interpolating any templating in the Template and then saving the whole Template into the `spec.status.tasks` field. As the Workflow progresses through its lifecycle, tink-controller will update fields like `seconds`, `startedAt`, and `state`. The `spec.status.state` field can be used to determine the current state of the Workflow and to identify any issues that may have occurred during the execution of the Workflow. Get the Workflow state by running `kubectl get wf -n tinkerbell -o=jsonpath="{.status.state}" example`. The `state` can be roughly separated into two groups: Execution state and final result.

### Execution States

During the execution, a Workflow goes through the following states:

- `PREPARING`: State of a new Workflow that's not yet ready for execution, e.g. because the `allowPXE` option needs to be toggled on the [Hardware] first
- `PENDING`: A Workflow ready for execution. First state of a new Workflow that does not need any further preparation
- `RUNNING`: State of a Workflow that is currently being executed on the target Hardware
- `POST`: This state indicates that the last Action of the last Task of the Workflow was successful and the Workflow is now executing post-run actions, e.g. toggling `allowPXE` back to `False` on the [Hardware]

### Final States

There are three terminal states in which a Workflow can be. These states have no further transitions and indicate the final result of the Workflow execution:

- `SUCCESS`: The Workflow was successful, all Actions in all Tasks were successful
- `FAILED`: At least one Action, or a preparatory/post step failed
- `TIMEOUT`: A Workflow ends up in this state when it hits the `global_timeout` set in the [Template] while still in the `RUNNING` state

## Troubleshooting

If after submitting a Workflow and a `kubectl get workflow example` does not show any `STATE` and/or a `kubectl get workflow example -o yaml` does not show the full Template there has most likely been an issue rendering the Template. For example, if a `{{ .key }}` referenced in the Template was not found in the Workflow `hardwareMap`. Check the logs of the [tink-controller] pod for any error messages.

## Other Resources

### v1alpha1 Spec

- [Workflow Kubernetes CRD]
- [Workflow Go struct definition]
- [Explorable Workflow Spec]

[Hardware]: /docs/concepts/hardware
[Template]: /docs/concepts/templates
[tink-controller]: /docs/services/tink-controller
[Workflow Kubernetes CRD]: {{< repo_tree "crd/bases/tinkerbell.org_workflows.yaml" >}}
[Workflow Go struct definition]: {{< repo_tree "api/v1alpha1/tinkerbell/workflow.go#L53" >}}
[Explorable Workflow Spec]: https://doc.crds.dev/github.com/tinkerbell/tinkerbell/tinkerbell.org/Workflow/v1alpha1@{{< tinkerbell_version >}}
