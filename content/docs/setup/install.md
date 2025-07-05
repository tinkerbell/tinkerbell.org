---
title: "Install"
draft: false
geekdocDescription: "Install the Tinkerbell stack."
---

This doc will guide you through the installation of the Tinkerbell stack.

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
# Get the pod CIDRs to set as trusted proxies
TRUSTED_PROXIES=$(kubectl get nodes -o jsonpath='{.items[*].spec.podCIDR}' | tr ' ' ',')

# Set the LoadBalancer IP for Tinkerbell services
LB_IP=192.0.2.116

# Set the artifacts file server URL for HookOS
ARTIFACTS_FILE_SERVER=http://192.0.2.117:7173

# Specify the Tinkerbell Helm chart version, here we use the latest release.
TINKERBELL_CHART_VERSION={{< tinkerbell_version >}}

helm install tinkerbell oci://ghcr.io/tinkerbell/charts/tinkerbell \
  --version $TINKERBELL_CHART_VERSION \
  --create-namespace \
  --namespace tinkerbell \
  --wait \
  --set "trustedProxies={${TRUSTED_PROXIES}}" \
  --set "publicIP=$LB_IP" \
  --set "artifactsFileServer=$ARTIFACTS_FILE_SERVER"
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

> You can display the default values of configuration parameters using the `helm show values oci://ghcr.io/tinkerbell/charts/tinkerbell --version {{< tinkerbell_version >}}` command.

1. Configure the Helm values for your environment.

   The following values are required to get the stack up and running in your environment. They are set either in a values file or as `--set` arguments.

   - `trustedProxies`: A comma-separated list of trusted proxies. This is used to configure the `X-Forwarded-For` header in HTTP requests for [Tootles] and `auto.ipxe` in [Smee].
   - `publicIP`: The IP address to use for the Kubernetes North/South load balancer. This should be a free IP address in the network where the Tinkerbell stack is deployed. See the upstream Kubernetes docs on [load balancers] for more information.
   - `artifactsFileServer`: The full URL to the HTTP server serving HookOS artifacts like the kernel and initramfs, for example `http://192.0.2.117:7173`

   For further settings, have a look at the [Chart's Readme]({{< repo_tree "helm/tinkerbell/README.md" >}}) and [values.yaml file]({{< repo_tree "helm/tinkerbell/values.yaml" >}}).

1. Install the Tinkerbell Helm chart.

   ```bash
   # Get the pod CIDRs to set as trusted proxies
   TRUSTED_PROXIES=$(kubectl get nodes -o jsonpath='{.items[*].spec.podCIDR}' | tr ' ' ',')
   
   # Set the LoadBalancer IP for Tinkerbell services
   LB_IP=192.0.2.116
   
   # Set the artifacts file server URL for HookOS
   ARTIFACTS_FILE_SERVER=http://192.0.2.117:7173
   
   # Specify the Tinkerbell Helm chart version, here we use the latest release.
   TINKERBELL_CHART_VERSION={{< tinkerbell_version >}}
   
   helm install tinkerbell oci://ghcr.io/tinkerbell/charts/tinkerbell \
     --version $TINKERBELL_CHART_VERSION \
     --create-namespace \
     --namespace tinkerbell \
     --wait \
     --set "trustedProxies={${TRUSTED_PROXIES}}" \
     --set "publicIP=$LB_IP" \
     --set "artifactsFileServer=$ARTIFACTS_FILE_SERVER"
   ```

1. Verify the stack is up and running.

   ```bash
   kubectl get pods -n tinkerbell # verify all pods are running
   kubectl get svc -n tinkerbell # Verify the tinkerbell service has the IP you specified with $LB_IP under the EXTERNAL-IP column
   ```

## Post installation steps

In order to start using the Tinkerbell stack and running Workflows, you will need to have Machines to provision and you'll need to create Hardware, Template, and Workflow objects.
See the docs on [Hardware], [Templates], and [Workflows] for more information.

## Uninstall

Uninstall the Tinkerbell stack via Helm.

```bash
helm uninstall tinkerbell -n tinkerbell
```

## Design notes

The Helm chart was designed to allow the entire stack to be hosted behind a single IP. This significantly simplifies the proper deployment of the stack.

In order to achieve this the stack chart does not use a Kubernetes ingress object and controller. This is because most ingress controllers do not support UDP, TCP, HTTP, and gRPC. The ingress controllers that do support UDP are generally a bit heavy to deploy and operate and require a lot of extra configuration, custom resources, etc.

To allow for this, the chart deploys a [kube-vip](https://kube-vip.io/) instance, which provides a LoadBalancer IP to the Tinkerbell service. Tinkerbell itself is a single binary listening on multiple ports for the different services making up the stack.
To allow for DHCP broadcast traffic to reach Tinkerbell, the chart manually creates an additional network interface on the host running Tinkerbell, which receives the broadcast traffic and forwards it to the Tinkerbell Pod.

In the future there is potential for moving away from this lightweight Nginx setup and using the [GatewayAPI] for traffic routing. As the Tinkerbell stack will require both UDP, TCP, and gRPC we'll need an implementation that can support all three. Currently, because of limited Maintainer cycles and the limited support for all these protocols in the existing GatewayAPI implementations, we have not pursued this path.

[^1]: The HookOS artifacts must be named as follows: `vmlinuz-x86_64`, `initramfs-x86_64`, `vmlinuz-aarch64`, and `initramfs-aarch64`

[GatewayAPI]: <https://kubernetes.io/docs/concepts/services-networking/gateway/>
[Tootles]: /docs/services/tootles
[Smee]: /docs/services/smee
[Hardware]: /docs/concepts/hardware
[Templates]: /docs/concepts/templates
[Workflows]: /docs/concepts/workflows
[load balancers]: <https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer>
