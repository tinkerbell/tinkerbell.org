---
title: "Install"
draft: false
geekdocDescription: "Install the Tinkerbell stack."
tinkerbellStackVersion: "0.4.3"
---

This doc will guide you through the installation of the Tinkerbell stack. You will need to have

## Prerequisites

- [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Helm](https://helm.sh/docs/intro/install/)
- A Kubernetes cluster running version 1.26 or later
- Network connectivity
  - Layer 2 network connectivity between the Tinkerbell stack and the machines to be provisioned  
  **OR**
  - a DHCP relay agent in your environment that is configured to forward DHCP traffic to the Tinkerbell stack.

## Install with Helm

This is the recommended way to install a production grade Tinkerbell stack. This will install all services and optionally (enabled by default) download [HookOS](https://github.com/tinkerbell/hook) images to the cluster.

## TL;DR

```bash
trusted_proxies=$(kubectl get nodes -o jsonpath='{.items[*].spec.podCIDR}' | tr ' ' ',')
# for RKE2 clusters run: 
# trusted_proxies=$(kubectl describe pod -n kube-system -l component=kube-controller-manager | grep "cluster-cidr" | xargs | cut -d"=" -f2)
LB_IP=<specify a Load balancer IP>
STACK_CHART_VERSION={{< stringparam "tinkerbellStackVersion" >}}
helm install tink-stack oci://ghcr.io/tinkerbell/charts/stack --version "$STACK_CHART_VERSION" --create-namespace --namespace tink-system --wait --set "smee.trustedProxies={${trusted_proxies}}" --set "hegel.trustedProxies={${trusted_proxies}}" --set "stack.loadBalancerIP=$LB_IP" --set "smee.publicIP=$LB_IP"
```

## Installation steps

This section describes the procedure to install the Tinkerbell stack using Helm. The general syntax for a Helm installation is:

```bash
helm install <release> <chart> --version <version> --create-namespace --namespace <namespace> --wait [--set <other_parameters>]
```

The variables specified in the command are as follows:

- `<chart>` A path to a packaged chart, a path to an unpacked chart directory or a URL.
- `<release>` A name to identify and manage the Helm chart once installed.
- `<version>` The version of the chart to install.
- `<namespace>` The namespace in which the chart is to be installed.

Default configuration values can be changed using one or more `--set <parameter>=<value>` arguments. Alternatively, you can specify several parameters in a custom values file using the `--values <file>` argument.

> You can display the default values of configuration parameters using the `helm show values oci://ghcr.io/tinkerbell/charts/stack --version {{< stringparam "tinkerbellStackVersion" >}}` command.

1. Configure the Helm values for your environment.

   The following values are required to get the stack up and running in your environment. They are set either in a values file or as `--set` arguments.

   - `smee.trustedProxies` and `hegel.trustedProxies`: A comma-separated list of trusted proxies. This is used to configure the `X-Forwarded-For` header in HTTP requests for [Hegel] and `auto.ipxe` in [Smee].
   - `stack.loadBalancerIP` and `smee.publicIP`: The IP address to use for the Kubernetes North/South load balancer.

   Other customization to note:

   - `stack.kubevip.enabled`: By default, the stack chart will install kube-vip to manage the load balancer IP. If you have a different solution for managing the load balancer IP, you can set this to `false`.
   - `stack.lbClass`: Use this only in conjunction with `stack.kubevip.enabled=false` to specify your load balancer class to use.
   - `stack.relay.enabled`: By default, this is set to `true`. If you have a DHCP relay agent in your environment that points to the Tinkerbell stack IP, you can set this to `false`.

1. Install the Tinkerbell stack chart.

   ```bash
   trusted_proxies=$(kubectl get nodes -o jsonpath='{.items[*].spec.podCIDR}' | tr ' ' ',')
   # for RKE2 clusters run: 
   # trusted_proxies=$(kubectl describe pod -n kube-system -l component=kube-controller-manager | grep "cluster-cidr" | xargs | cut -d"=" -f2)
   LB_IP=<specify a Load balancer IP>
   STACK_CHART_VERSION=0.4.3
   helm install tink-stack oci://ghcr.io/tinkerbell/charts/stack --version "$STACK_CHART_VERSION" --create-namespace --namespace tink-system --wait --set "smee.trustedProxies={${trusted_proxies}}" --set "hegel.trustedProxies={${trusted_proxies}}" --set "stack.loadBalancerIP=$LB_IP" --set "smee.publicIP=$LB_IP"
   ```

1. Verify the stack is up and running.

   ```bash
   kubectl get pods -n tink-system # verify all pods are running
   kubectl get svc -n tink-system # Verify the tink-stack service has the IP you specified with $LB_IP under the EXTERNAL-IP column
   kubectl get jobs -n tink-system # Verify the download-hook job has completed
   ```

## Post installation steps

In order to start using the Tinkerbell stack and running Workflows, you will need to have Machines to provision and you'll need to create Hardware, Template, and Workflow objects.
See the docs on [Hardware], [Templates], and [Workflows] for more information.

## Uninstall

Uninstall the Tinkerbell stack via Helm and by deleting the HookOS artifacts.

```bash
helm uninstall tink-stack -n tink-system
# either ssh into the cluster or use a Kubernetes job to delete the HookOS artifacts. By default the will live on the host at /opt/hook. See `stack.hook.downloadsDest`.
```

## Design notes

The Helm chart was designed to allow the entire stack to be hosted behind a single IP. This significantly simplifies the proper deployment of the stack.

In order to achieve this the stack chart does not use a Kubernetes ingress object and controller. This is because most ingress controllers do not support UDP, TCP, HTTP, and gRPC. The ingress controllers that do support UDP are generally a bit heavy to deploy and operate and require a lot of extra configuration, custom resources, etc.

The stack chart deploys a very light weight Nginx deployment with a straightforward configuration that accommodates almost all the Tinkerbell stack services and file serving of the HookOS artifacts. Nginx does not support DHCP. For this a DHCP relay agent is required and we deploy a lightweight agent in the same pod as Nginx.

In the future there is potential for moving away from this lightweight Nginx setup and using the [GatewayAPI] for traffic routing. As the Tinkerbell stack will require both UDP, TCP, and gRPC we'll need an implementation that can support all three. Currently, because of limited Maintainer cycles and the limited support for all these protocols in the existing GatewayAPI implementations, we have not pursued this path.

[GatewayAPI]: <https://kubernetes.io/docs/concepts/services-networking/gateway/>
[Hegel]: /docs/services/hegel
[Smee]: /docs/services/smee
[Hardware]: /docs/concepts/hardware
[Templates]: /docs/concepts/templates
[Workflows]: /docs/concepts/workflows
