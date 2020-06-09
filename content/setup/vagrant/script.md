+++
title = "Automation Script"
date = 2020-06-08T16:16:15+05:30
draft = false
weight = 10
toc = true
+++


- The script is used to automate the Tinkerbell stack setup.
- It also serves the purpose of quick testing by creating a [Hello World!](/examples/hello-world) workflow.
- The complete script can be found [here](https://raw.githubusercontent.com/tinkerbell/tink/master/deploy/vagrant/tinkerbell.sh).
- The sections below explain different important parts of the script.


#### Provisioner IP Address

- The provisioner IP address is passed as an argument to the script from the Vagrantfile.

```
provisioner_ip_address="${1:-10.10.10.2}";
```

- If you want to change the provisioner IP, you can set the `provisioner_ip_address = '10.11.12.2'` in Vagrantfile.


#### The Environment Variables

- Following are the required environment variables to setup the tinkerbell stack.

```
export TB_INTERFACE='eth1'
export TB_NETWORK="$provisioner_ip_address/24"
export TB_IPADDR="$provisioner_ip_address"
export TB_REGUSER='tinkerbell'
export TB_OSIE_TAR=/vagrant/osie.tar.gz
```

- You must have created a directory and then downloaded `osie.tar.gz` while following the steps [here](/setup/vagrant/#steps).
- This directory is in sync with the `/vagrant` directory on the provisioner.

```
provisioner.vm.synced_folder '.', '/vagrant', type: 'rsync'
```

- Therefore, we can set the `TB_OSIE_TAR` variable and let the tinkerbell setup [script](https://github.com/tinkerbell/tink/blob/master/setup.sh#L301) know that we have the OSIE tar already.
- In case you want to recreate the setup from scratch, you can still use the same OSIE tar file and avoid the download during setup.


#### Create a Workflow

- Create the hello-world workflow template and get the template ID for later use.

```
docker exec -i deploy_tink-cli_1 sh -c 'cat >/tmp/hello-world.tmpl' <<EOF
version: '0.1'
global_timeout: 60
tasks:
  - name: hello-world
    worker: {{.device_1}}
    actions:
      - name: hello-world
        image: hello-world
        timeout: 60
EOF
template_output="$(docker exec -i deploy_tink-cli_1 tink template create --name hello-world --path /tmp/hello-world.tmpl)"
template_id="$(echo "$template_output" | perl -n -e '/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/ && print $1')"
```

- Push worker hardware data into the database.
You may choose a different host number for your worker based on your network configuration.

```
worker_host_number=11
worker_ip_address="$(echo $provisioner_ip_address | cut -d "." -f 1).$(echo $provisioner_ip_address | cut -d "." -f 2).$(echo $provisioner_ip_address | cut -d "." -f 3).$worker_host_number"
worker_mac_address="08:00:27:00:00:01"
  
docker exec -i deploy_tink-cli_1 tink hardware push <<EOF
{
  "id": "870fe43f-a58e-4f69-af39-0d612a6587c1",
  "arch": "x86_64",
  "allow_pxe": true,
  "allow_workflow": true,
  "facility_code": "onprem",
  "ip_addresses": [
    {
      "enabled": true,
      "address_family": 4,
      "address": "$worker_ip_address",
      "netmask": "255.255.255.0",
      "gateway": "$provisioner_ip_address",
      "management": true,
      "public": false
    }
  ],
  "network_ports": [
    {
      "data": {
        "mac": "$worker_mac_address"
      },
      "name": "eth0",
      "type": "data"
    }
  ]
}
EOF
```

- It is important to note that the value of `worker_mac_address` must be same as what you have in the Vagrantfile.
- If you want to run multiple workers, you need to ensure that the hardware data (with correct MAC address) for all those workers is present in the database.


- Create a workflow using the above created template and hardware.

```
workflow_output="$(docker exec -i deploy_tink-cli_1 tink workflow create -t "$template_id" -r "{\"device_1\": \"$worker_mac_address\"}")"
workflow_id="$(echo "$workflow_output" | perl -n -e '/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/ && print $1')"
docker exec -i deploy_tink-cli_1 tink workflow get "$workflow_id"
```


#### The Summary

- The summary is printed after the provisioner setup is complete.

```
# e.g. inet 192.168.121.160/24 brd 192.168.121.255 scope global dynamic eth0
host_ip_address="$(ip addr show eth0 | perl -n -e'/ inet (\d+(\.\d+)+)/ && print $1')"
cat <<EOF

#################################################
#
# tink envrc
#

$(cat /root/tink/envrc)

#################################################
#
# addresses
#

kibana: http://$host_ip_address:5601

EOF
```
- You may update the script to provide different essential details as per your need.

