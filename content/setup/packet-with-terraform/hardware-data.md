+++
title = "Hardware Data"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 20
toc = true
+++

### Pushing hardware data

- Exec into the tink CLI container using `docker exec -ti deploy_tink-cli_1 /bin/sh`:
- Create a file containing the hardware data (say data.json)
  - ensure that you replace _<worker_mac_addr>_ with the actual worker MAC.
  - the worker MAC can be found in the Terraform output (and also in the generated _terraform.tfstate_ file).
  - if you did not use Terraform to provision the servers, you can call the Packet API _devices_ endpoint, and the worker MAC will be the MAC under _eth0_.

```
https://api.packet.net/devices/{device_id}
...
          "type": "NetworkPort",
          "name": "eth0",
          "data": {
              "bonded": false,
              "mac": "00:00:00:00:00:00" // worker mac
          },
...
```

- Here is the minimal hardware data that can get you started with the [Hello World!](/examples/hello-world) example.

```json
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

- You can read more about the hardware data under [here](/hardware-data).

{{% notice note %}}
You will also have to adjust the `address` and `gateway` under `ip_addresses` accordingly if you chose a non-default subnet and host IP address.
{{% /notice %}}

- Push the hardware data into database with _either_ of the following:

```
$ tink hardware push --file data.json
$ cat data.json | tink hardware push
```

- If the data is valid, you must see a success message.

You can now follow the steps defined in the [Hello World!](/examples/hello-world) example to test if the setup is ready.
