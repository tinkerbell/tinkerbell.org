+++
title = "Hegel"
hidden = true
date = 2020-07-06
draft = false
weight = 01
toc = false
+++

GitHub repository: [tinkerbell/hegel](https://github.com/tinkerbell/hegel).

## Data is power

Every cloud provider is capable of exposing metadata to servers that you can
query as part of your automation usually via HTTP:

* [AWS: Instance metadata and user data](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html)
* [GCP: Storing and retrieving instance metadata](https://cloud.google.com/compute/docs/storing-retrieving-metadata)
* [Packet: Metadata](https://www.packet.com/developers/docs/servers/key-features/metadata/)

Hegel provides gRPC and HTTP support. Plus a compatible layer with the AWS EC2
metadata format.

The metadata can be used from a Tinkerbell workflow as well.

## Where metadata comes from

If you are asking yourself where metadata are coming from, you have to look at
yourself to the answer. Metadata are set as part of the hardware registration.

## Familiarize with hegel

I am using the [Vagrant Setup](/docs/local-with-vagrant) as the environment of
reference.

Hegel runs as part of the provisioner virtual machine with the IP:
`192.168.1.2`. When the worker starts and you logged in
[osie](/docs/services/osie) using the password `root` you can access the
metadata for your server via `cURL`:

```
$ curl -s 192.168.1.2/metadata | jq .
{
    "facility": {
        "facility_code": "onprem"
    },
    "instance": {},
    "state": ""
}
```

If you look at the `hardware-data.json` that we used during the Vagrant Setup
you will find the `facility_code=onprem` as well. That's where the metadata
comes from.  You can use the same format AWS EC2 uses, to get the meta-data
index:

```
$ curl -s 192.168.1.2/2009-04-04/meta-data
```
