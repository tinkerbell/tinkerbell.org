+++
title = "Workflows"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 40
toc = true
+++

### Pushing hardware data into database
1. Exec into the _deploy_tink-cli_1_ container.
2. Create a file containing the hardware data (in json format), replacing _<worker_mac_addr>_ with the actual worker MAC
   - The worker MAC can be found in the Terraform output (and also in the generated _terraform.tfstate_ file).
     However, if you did not use Terraform to provision the servers, you can call the Packet API _devices_ endpoint, and the worker MAC will be the MAC under _eth0_.
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
3. Push the hardware data into the database.
```
$ docker exec -it deploy_tink-cli_1 ash
/# vi /tmp/hardware.json
{
  "id": "373324c8-7fb5-11ea-9227-0242ac120004",
  "arch": "x86_64",
  "allow_pxe": true,
  "allow_workflow": true,
  "ip_addresses": [
    {
     "address": "192.168.1.5",
     "address_family": 4,
     "enabled": true,
     "gateway": "192.168.1.1",
     "management": true,
     "netmask": "255.255.255.0",
     "public": false
    }
  ],
  "facility_code": "ewr1",
  "network_ports": [
    {
      "data": {
      "mac": "<worker_mac_addr>"
      },
      "name": "eth0",
      "type": "data"
    }
  ]
}

/# tink hardware push "`cat /tmp/hardware.json`"
/# tink hardware all
```

{{% notice note %}}
You will also have to adjust the `address` and `gateway` under `ip_addresses` accordingly if you chose a non-default subnet and host IP address.
{{% /notice %}}

### Creating a workflow
1. Exec into the _deploy_tink-cli_1_ container.
2. Create target, replacing <worker_mac_addr> with the actual worker MAC address.
3. Create template.
4. Create workflow.
```
$ docker exec -it deploy_tink-cli_1 ash
/# tink target create '{"targets": {"machine1": {"mac_addr": "<worker_mac_addr>"}}}'
/# vi /tmp/hello.tmpl
version: '0.1'
name: hello_world
global_timeout: 6000
tasks:
- name: "hello-world"
  worker: "{{index .Targets "machine1" "mac_addr"}}"
  actions:
  - name: "hello-world"
    image: hello-world
    timeout: 90

/# tink template create -n 'hello-world' -p /tmp/hello.tmpl
/# tink workflow create -r <target_id> -t <template_id>
/# tink workflow get <workflow_id>
```

### Trigger the workflow
1. Reboot _tf-worker_.
2. Use the Out-of-Band Console to connect with the worker machine and monitor progress.
3. On tf-provisioner, you can check on the workflow state and events using:
```
$ docker exec -it deploy_tink-cli_1 ash
/# tink workflow state <workflow-id>
/# tink workflow events <workflow-id>
```
