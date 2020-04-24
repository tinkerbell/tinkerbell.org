# Tinkerbell

## Provisioner and Worker Setup 
This demo will guide you through the process of setting up a minimal system of two machines, a provisioner and a worker, as well as run a sample workflow that will display a simple hello world.

Below are brief descriptions of the roles each of the machines play in the system:

#### Provisioner
- Acts as the DHCP server
- Keeps track of all the workflows
- Hosts any files necessary for the workflows to execute

#### Worker
- Is the machine that is being acted on
- Asks the provisioner for available workflows 
- Executes the ones specified for itself

It is important to note that you can run any workflow using this setup, but the purpose of this sample is to allow you to get a sense of how things work at a basic level.


### I. Create the servers
Using Terraform (with the Packet provider), create two servers `tf-provisioner` and `tf-worker` attached to the same VLAN.  

 - Clone the [`tink`](https://github.com/tinkerbell/tink) repository locally and switch to the `demo-v2` branch:
```shell script
$ git clone https://github.com/tinkerbell/tink.git
$ cd tink
$ git checkout demo-v2
$ cd demo/terraform
```

 - Update the `<packet_api_token>` and `<project_id>` fields in `input.tf` with your Packet API token and desired project ID
 - You may also update the hostnames in `main.tf` if you prefer names other than `tf-provisioner` and `tf-worker`
 - Run the following commands:
```shell script
$ terraform init
$ terraform apply
``` 

**Note:** As an output, it returns the IP address of the provisioner and MAC address of the worker machine.

### Manual Setup

If you do not wish to use Terraform, you can provision the servers manually with the following configurations.

#### Provisioner
- Plan: `c3.small.x86` (or any plan that supports Layer 2)
- OS: `Ubuntu 18.04 LTS`
- After device is provisioned:
    - Convert network type to `Mixed/Hybrid`
    - Attach VLAN to interface `eth1` (under Layer 2)

#### Worker
- Facility: `<same_as_provisioner>`
- Plan: `c3.small.x86` (or any plan that supports Layer 2)
- OS: `Custom iPXE`
    - IPXE Script URL: `https://boot.netboot.xyz`
    - Always/Persist PXE: `true`
- After device is provisioned:
    - Convert network type to `Layer 2 (individual)`
    - Attach VLAN to interface `eth0`
    - Same VLAN as provisioner


### II. Prep the provisioner machine

SSH into `tf-provisioner` for the following portion.

**Note:** From here on out, assume all code blocks are run in bash unless specified.

#### Run the setup script
The `setup.sh` script will configure the network, download necessary files, set up the certs and registry, and bring up the stack.  
The script is also separated into functions so you can rerun specific parts as needed.
```shell script
wget https://raw.githubusercontent.com/tinkerbell/tink/master/setup.sh && chmod +x setup.sh
./setup.sh
```

### III. Action Images
Push the worker image responsible for retrieving and executing the workflows for the worker to the registry.
```shell script
docker pull quay.io/tinkerbell/tink-worker:latest
docker tag quay.io/tinkerbell/tink-worker:latest 192.168.1.1/tink-worker .
docker push 192.168.1.1/tink-worker
```

The registry must have an image for all the actions in a workflow. To push an action image:
```shell script
docker tag <action-image> <registry-host>/<action-image>
docker push <registry-host>/<action-image>
```

For this demo, we are going to need an action image for displaying hello-world.
```shell script
docker pull hello-world
docker tag hello-world 192.168.1.1/hello-world
docker push 192.168.1.1/hello-world
```

### IV. Workflows

#### Pushing hardware data into database

1. Exec into the `deploy_tink-cli_1` container.
2. Create a file containing the hardware data (in json format), replacing `<worker_mac_addr>` with the actual worker MAC.
    * The worker MAC can be found in the Terraform output (and also in the generated `terraform.tfstate` file). However, if you did not use Terraform to provision the servers, you can call the [Packet API `devices` endpoint](https://www.packet.com/developers/api/devices/#retrieve-a-device), and the worker MAC will be the MAC under `eth0`.
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

**Note:** You will also have to adjust the `address` and `gateway` under `ip_addresses` accordingly if you chose a non-default subnet and host IP address.

#### Creating a workflow
1. Exec into the `deploy_tink-cli_1` container.
2. Create `target`, replacing `<worker_mac_addr>` with the actual worker MAC address.
3. Create `template`.
4. Create `workflow`.

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

### V. Trigger the Workflow
1. Reboot `tf-worker`.
2. Use the Out-of-Band Console to connect with the worker machine and monitor progress.
3. On `tf-provisioner`, you can check on the workflow state and events using:
```
$ docker exec -it deploy_tink-cli_1 ash
/# tink workflow state <workflow-id>
/# tink workflow events <workflow-id>
```
**Note:** Once the workflow succeeds, disable Always IPXE on `tf-worker` and reboot it one more time to see that it is officially running Ubuntu 18.04.

---

## Troubleshooting
The following are possible errors you might run into and their possible solutions.

```
PowerEdge R6415 - BIOS 1.8.7
A system restart is required. The system detected an exception during the UEFI
pre-boot environment.
```
* Set the worker to always PXE

```
Login did not succeed, error: Error response from daemon: Get https://192.168.1.1/v2/: x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "Autogenerated CA")
```
* Rebuild the registry container (after rebuilding the certs container)

```
Waiting for docker to respond...
WARNING! Using --password via the CLI is insecure. Use --password-stdin.
Error response from daemon: Get https://192.168.1.1/v2/: x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "Autogenerated CA")
```
* Copy the ca.pem file over to the `/etc/tinkerbell/nginx/workflow` directory (after rebuilding the certs container)

```
See 'docker run --help'.
 * start-stop-daemon: failed to start `/sbin/workflow-helper'
 * Failed to start Packet Workflow
 [ !! ]
 * ERROR: workflow-helper failed to start
```
* Log into console with username `root` and run the following command:
```shell script
docker run -it --privileged=true \
	-e "DOCKER_API_VERSION=v1.35" \
    -e "WORKER_ID=fde7c87c-d154-447e-9fce-7eb7bdec90c0" \
    -e "DOCKER_REGISTRY=192.168.1.1" \
    -e "TINKERBELL_GRPC_AUTHORITY=192.168.1.1:42113" \
    -e "TINKERBELL_CERT_URL=http://192.168.1.1:42114/cert" \
    -e "REGISTRY_USERNAME=admin" \
    -e "REGISTRY_PASSWORD=admin123" \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /worker:/worker \
    -v /dev:/dev \
	-v /etc/docker/cert.d/192.168.1.1:/192.168.1.1 \
	192.168.1.1/tink-worker
```

```
ERRO[0000] Worker Finished with error rpc error: code = Unavailable desc = connection error: desc = "transport: authentication handshake failed: x509: certificate is valid for 127.0.0.1, not 192.168.1.1"
 [ ok ]
```
* Tear down the stack with `docker-compose down -v`
* Rerun the setup script with just the following functions:
    * `build_and_setup_certs`
    * `build_registry_and_update_worker_image`
    * `start_docker_stack`
* Re-push the tink-worker and action images
```shell script
docker push 192.168.1.1/tink-worker
docker push 192.168.1.1/ubuntu:base
docker push 192.168.1.1/disk-wipe:v3
docker push 192.168.1.1/disk-partition:v3
docker push 192.168.1.1/install-root-fs:v3
docker push 192.168.1.1/install-grub:v3
```
* Recreate the workflow