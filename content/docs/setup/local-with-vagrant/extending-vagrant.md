+++
title = "Extending the Vagrant Setup"
date = 2020-08-14
draft = false
weight = 10
toc = true
+++

If you have followed the guide to getting Vagrant set up locally, you might be interested in other things you can do with it. There are some steps that you may need to take in order to make the setup a bit more functional.

## Getting Your Worker Connected to the Internet

A Worker machine created by Vagrant is not Internet facing because the newly deployed host uses the tink server as its network gateway. If you are looking to develop more workflows, it might be useful to allow the Worker access to the Internet to do things like run `apt-get update` or pull down images directly from Docker.

In order to provide this functionality, you need to configure `iptables` so the network gateway can speak to the Internet, allowing the Worker machine Internet access.

SSH into the Provisioner.

Set the environment variables of the two network interfaces:

```
export main=<public_ip_iface>
export vagrant=<tinkerbell_ip_iface>
```

Enable Internet forwarding on the tink server. (Note: This is not permanent, you would need to edit `/etc/sysctl` to make it permanent.)

```
echo 1 > /proc/sys/net/ipv4/ip_forward
```

Forward traffic from the vagrant network to main interface.

```
iptables -A FORWARD -i $vagrant -o $main -j ACCEPT
```

Forward the existing traffic back from the main interface to the vagrant network.

```
iptables -A FORWARD -i $main -o $vagrant -m state --state ESTABLISHED,RELATED \
         -j ACCEPT
```

Translate addresses so traffic appears to have come from the correct address.

```
iptables -t nat -A POSTROUTING -o $vagrant -j MASQUERADE
```

## Running Tests with Vagrant

If you are developing on Tinkerbell, it might be handy to know that the Vagrant setup serves as the backbone of some of the end-to-end testing. The scripts that set up and run the tests are in the `tink` repository, in the `test/_vagrant` directory.

The requirements for the tests are the same as the Vagrant setup itself, along with Go installed on your local machine.

To run the tests, run the `go test` command, pointed at the `test/_vagrant` directory.

```
go test ./test/_vagrant/...
```
