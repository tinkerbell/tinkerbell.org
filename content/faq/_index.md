+++
title = "Frequently Asked Questions"
menuTitle= "FAQ's"
disableToc = "true"
date = 2020-10-28
weight = 120
sidebar = "false"
+++

{{%faq "Does Tinkerbell work outside of Equinix Metal's hosting service?" %}}
Yes, it will work outside of Equinix Metal. Our default setup script should work on any install of Ubuntu and CentOS.
{{% /faq%}}

{{%faq "Does using Tinkerbell rely on having a Equinix Metal account?" %}}
No, you can follow our [local development guide](https://docs.tinkerbell.org/setup/local-vagrant/) to run Tinkerbell on your local machine.
{{% /faq%}}

{{%faq "Can Tinkerbell be used to install OSes without Internet access (where both the Provider and Worker hosts are in an isolated network)?" %}}
Yes, OS images are served from the NGINX running on the [provisioner](https://docs.tinkerbell.org/architecture/).
{{% /faq%}}

{{%faq "What operating systems is Tinkerbell able to install?" %}}
Any! Out of the box, we are working to provide installation workflows for deb and rpm-based systems, but it can be used for anything (as it includes a generic workflow engine).
{{% /faq%}}

{{%faq "Can Tinkerbell install operating systems using their original, unmodified ISO images?" %}}
Yes.
{{% /faq%}}

{{%faq "Which server makes and models is Tinkerbell able to install operating systems on?" %}}
Tinkerbell currently works on any system with IPMI, and has special support for Dell's (racadm). Host-side, our installation supports NICs such as Broadcom, Intel, Netronome, Mellanox, and a few others out of the box.
{{% /faq%}}

{{%faq "Is Tinkerbell able to operate remote server power settings (power on; power off)? How about resetting?" %}}
Yes, via the [PBnJ microservice](https://docs.tinkerbell.org/#whats-powering-tinkerbell).
{{% /faq%}}

{{%faq "Does Tinkerbell use each operating system's native network installer program, or does it install using a different method?" %}}
It depends on the operating system, the installation environment supports non-NM and NM for rpm-based systems, and the standard deb-based network interfaces.
{{% /faq%}}
