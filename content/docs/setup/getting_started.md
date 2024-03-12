---
title: "Getting Started"
draft: false
geekdocDescription: "How to try out Tinkerbell quickly and easily."
---

This guide lets you quickly evaluate Tinkerbell. We'll walk you through some network booting basics, setting up the Tinkerbell stack, and provisioning a sample machine.

## Network booting

## Install via Helm chart

```bash
trusted_proxies=$(kubectl get nodes -o jsonpath='{.items[*].spec.podCIDR}' | tr ' ' ',')
LB_IP=<specify a Load balancer IP>
STACK_CHART_VERSION=0.4.3
helm install tink-stack oci://ghcr.io/tinkerbell/charts/stack --version "$STACK_CHART_VERSION" --create-namespace --namespace tink-system --wait --set "smee.trustedProxies={${trusted_proxies}}" --set "hegel.trustedProxies={${trusted_proxies}}" --set "stack.loadBalancerIP=$LB_IP" --set "smee.publicIP=$LB_IP"
```

Verify all components are running properly:

```shell
kubectl get pods -n tink-system # verify all pods are running
kubectl get svc -n tink-system # Verify the tink-stack service has the IP you specified with $LB_IP under the EXTERNAL-IP column
```

## Create Hardware, Template, and Workflow objects

## Uninstall

```bash
helm uninstall tink-stack -n tink-system
```

## Get Help

Need a little help getting started? We're here!

- Check out the [FAQs] - When there are questions, we document the answers.
- Join the [CNCF Community Slack].
  Look for the [#tinkerbell] channel.
- Submit an issue on [Github].

[cncf community slack]: https://slack.cncf.io/
[faqs]: /faq/
[github]: https://github.com/tinkerbell
[#tinkerbell]: https://app.slack.com/client/T08PSQ7BQ/C01SRB41GMT
[playground]: https://github.com/tinkerbell/playground