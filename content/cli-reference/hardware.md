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

```
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

Consider a file `data.json` that contains the following hardware data for a worker machine to be part of a workflow:

```
{
  "id": "0eba0bf8-3772-4b4a-ab9f-6ebe93b90a94",
  "metadata": {
    "facility": {
      "facility_code": "ewr1",
      "plan_slug": "c2.medium.x86",
      "plan_version_slug": ""
    },
    "instance": {},
    "state": ""
  },
  "network": {
    "interfaces": [
      {
        "dhcp": {
          "arch": "x86_64",
          "ip": {
            "address": "192.168.1.5",
            "gateway": "192.168.1.1",
            "netmask": "255.255.255.248"
          },
          "mac": "00:00:00:00:00:00",
          "uefi": false
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

- Push the data with either of the following:

```
$ tink hardware push --file data.json
$ cat data.json | tink hardware push
```

- Get hardware data using ID:

```
$ tink hardware id ce2e62ed-826f-4485-a39f-a82bb74338e2
```

- Get hardware data using MAC address:

```
$ tink hardware mac 00:00:00:00:00:00
```

- Get hardware data using IP address:

```
$ tink hardware ip 192.168.1.5
```
