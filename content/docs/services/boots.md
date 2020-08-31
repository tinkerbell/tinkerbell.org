+++
title = "Boots"
hidden = true
date = 2020-07-06
draft = false
weight = 01
toc = false
+++

GitHub repository: [tinkerbell/boots](https://github.com/tinkerbell/tink).

## Netboot, netboot everything

One of the core concept behind tinkerbell is netbooting. There are a lot of
articles and use cases around it, here a few that I enjoyed or even wrote:

* [First journeys with netboot and ipxe installing Ubuntu](https://gianarb.it/blog/first-journeys-with-netboot-ipxe)
* [The state of netbooting Raspberry Pis](https://blog.alexellis.io/the-state-of-netbooting-raspberry-pi/)
* [RedHat Enterprise Linux: PREPARING FOR A NETWORK INSTALLATION](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/installation_guide/chap-installation-server-setup)

In general the complexity hides at the boot. Let's imagine you are in a
datacenter with hundreds of servers, it is not reasonable to go over all of the
one by one with a USB stick to install the operating system you need. If you use
a bare metal cloud provider like [Packet.com](https://packet.com/) where OS are
provisioner with an API things get even more complicated and they don't have an
operator running around with USB stick for every API request.

The bootloader uses a technology called PXE. Where all
the other devices such as HD, USB does not boot the server enter the netboot phase.

Netboot has a lot of different way to work but the one we use starts chaining
[iPXE](](http://ipxe.org/) (PXE with steroid), it follows with a DHCP
request from the server that has to be provisioner. When the DHCP respond the
server has its own IP address and can communicate over TFTP to download the iPXE
script.

The iPXE script teaches the system to download and boot an in memory operating
system called [Osie](/docs/services/osie). From there you are inside an OS and
you can do what you like, the most common action is to partition your hard drive
and to install the actual operating system you like. Tinkerbell abstract those
actions with the concept of a Workflow.

Long story short `boots` does a lot of what I described. It is a `DHCP` server
written in Go, it servers `iPXE` and it has `tftp` server.
