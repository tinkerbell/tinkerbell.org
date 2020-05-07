+++
title = "Hardware"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 10
toc = true
+++

Hardware (worker) data operations.

### Synopsis

Hardware operations:
```shell
  all         Get all known hardware for facility
  id          Get hardware by id
  ingest      Trigger tinkerbell to ingest
  ip          Get hardware by any associated ip
  mac         Get hardware by any associated mac
  push        Push new hardware to tinkerbell
  watch       Register to watch an id for any changes
```

### Options

```
  -h, --help   help for hardware
```

### Examples

Consider the following hardware data (saved as data.json) for a worker machine to be part of a workflow:
```json
{
  "id": "ce2e62ed-826f-4485-a39f-a82bb74338e2",
  "arch": "x86_64",
  "allow_pxe": true,
  "allow_workflow": true,
  "facility_code": "onprem",
  "ip_addresses": [
    {
      "address": "192.168.1.5",
      "address_family": 4,
      "enabled": true,
      "gateway": "192.168.1.1",
      "management": true,
      "netmask": "255.255.255.248",
      "public": false
    }
  ],
  "network_ports": [
    {
      "data": {
        "mac": "ec:0d:9a:bf:ff:dc"
      },
      "name": "eth0",
      "type": "data"
    }
  ]
}
```

 - push the data with either of the following:
```shell
$ tink hardware push --file data.json
$ cat data.json | tink hardware push
```

 - get hardware data using ID:
```shell
$ tink hardware id ce2e62ed-826f-4485-a39f-a82bb74338e2
```

 - get hardware data using MAC address:
```shell
$ tink hardware mac ec:0d:9a:bf:ff:dc
```

 - get hardware data using IP address:
```shell
$ tink hardware ip 192.168.1.5
```
