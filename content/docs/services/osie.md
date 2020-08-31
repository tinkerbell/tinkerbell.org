+++
title = "Osie"
hidden = true
date = 2020-07-06
draft = false
weight = 01
toc = false
+++

As part of the [boots](/docs/services/boots) documentation you will learn how
netboot works very briefly. But one of the step when a server boots is the
operating system. I am not speaking about the one you will use at the end like:
Ubuntu, CoreOS, CentOS. At this phase, when a server does not have an operating
system yet we need to have an environment capable of running the right actions
required to install our operating system.

Typically this environment is an in memory operating system and the one we
developed is based on [Alpine](https://alpinelinux.org) and it is called osie.

## Why Alpine

Alpine is famous to be small (~130MB of storage) and easy to customize.
The boot process is minimal and it does not require much configuration.

## Alpine vs Osie

Osie as you see it today is a bit "too fat"! Packet uses it internally and we
are in the process of moving a lot of the customisation out of osie as part of
external workflows, now that tinkerbell gives us that concept.

Anyway, osie gets compiled to a init ramdisk and a kernel. The init ramdisk
contains Docker and it starts the [`tink-worker`](/docs/services/tink) as a
docker container.

The `tink-worker` is the application that gets and manage workflows. Usually one
of the first workflows it generates is the one that persist an operating system.

## When you use it

Osie is downloaded from your worker via iPXE if the workers enters the netboot
phase. Usually it happens when an operating system is not installed, otherwise
the bootloader will boot from HD that contains your operating system.

If you followed the [Vagrant Setup](/docs/locally-with-vagrant) tutorial you
used `osie` already at the section "Start the Worker".

At that time no workflow is executed yet and the worker does not have an
operating system yet.

![Screenshot from the worker](/images/vagrant-setup-vbox-worker.png)

`Welcome to Alpine Linux 4.7` comes from osie.
