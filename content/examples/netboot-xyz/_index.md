+++
title = "Netboot.xyz"
date = 2021-03-12
draft = false
weight = 10
toc = true
+++

The "netboot.xyz" example shows how to have Tinkerbell boot a machine with a custom iPXE script and into the [netboot.xyz](https://netboot.xyz/) installer menu.
This example does not require creating a [template](https://docs.tinkerbell.org/templates/) or a [workflow](https://docs.tinkerbell.org/workflows/working-with-workflows/).

## Prerequisites

- You have a Tinkerbell stack installed, configured, and up and running.
This can be done [locally with Vagrant](https://docs.tinkerbell.org/setup/local-vagrant/), on [Equinix Metal](https://docs.tinkerbell.org/setup/equinix-metal-terraform/), or on [any other environment](https://docs.tinkerbell.org/setup/on-bare-metal-with-docker/) that you have configured.
- You have a Worker that has not yet been brought up, or can be restarted.

## Hardware Data

This is the only Tinkerbell resource you'll need to create.
Use the example below as a template.
At a minimum update the `"mac"`, `"address"`, `"netmask"`, and `"gateway"` fields for your targeted machine and network.
Setting the "`ipxe_script_url`", "`distro`", and "`slug`" are what tell [boots](https://docs.tinkerbell.org/services/boots/) to load into the `netboot.xyz` iPXE menu.

## Usage

1. Modify the example hardware data below
2. Save the hardware data to a file, e.x. `hardware.json`
3. Push the hardware data to [Tink server](https://docs.tinkerbell.org/services/tink-server/) using the [Tink cli](https://docs.tinkerbell.org/services/tink-cli/)

```bash
docker exec -i deploy_tink-cli_1 tink hardware push < ./hardware.json
```

```json
{
    "id": "ce2e62ed-826f-4485-a39f-a82bb74338e3",
    "metadata": {
        "facility": {
            "facility_code": "onprem",
            "plan_slug": "c2.medium.x86",
            "plan_version_slug": ""
        },
        "instance": {
            "ipxe_script_url": "https://boot.netboot.xyz/ipxe/netboot.xyz.lkrn",
            "operating_system": {
                "distro": "custom_ipxe",
                "slug": "custom_ipxe"
              }
        },
        "state": ""
    },
    "network": {
        "interfaces": [
            {
                "dhcp": {
                    "mac": "00:50:56:25:11:0e",
                    "name_servers": [
                        "1.1.1.1",
                        "8.8.8.8"
                    ],
                    "arch": "x86_64",
                    "ip": {
                        "address": "192.168.2.130",
                        "netmask": "255.255.255.0",
                        "gateway": "192.168.2.1"
                    }
                },
                "netboot": {
                    "allow_pxe": true,
                    "allow_workflow": true
                }
            }
        ]
    }
}
```

## Boot the machine

Now you can set the machine to pxe boot and either reboot or start it up.
The machine will boot into the `netboot.xyz` menu.
![netboot-menu.png](images/netboot-menu.png#1)
