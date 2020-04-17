# Tinkerbell

## Provisioner and Worker Setup 
This demo will guide you through the process of setting up a minimal system of two machines, a provisioner and a worker, as well as run a sample workflow that will install Ubuntu 18.04 onto the worker.

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

 - Clone the [`tink`](https://github.com/tinkerbell/tink) repository locally:
```shell script
$ git clone https://github.com/tinkerbell/tink.git
$ cd tink/demo/terraform
```

 - Update `input.tf` with your Packet API token and desired project ID
 - You may also update the hostnames in `main.tf` if you prefer names other than `tf-provisioner` and `tf-worker`
 - Run the following commands:
```shell script
$ terraform init
$ terraform apply
``` 

As an output, it returns the IP address of the provisioner and MAC address of the worker machine.

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

#### Install Git and Git LFS
```shell script
sudo apt-get update -y
sudo apt install -y git  
wget https://github.com/git-lfs/git-lfs/releases/download/v2.9.0/git-lfs-linux-amd64-v2.9.0.tar.gz  
tar -C /usr/local/bin -xzf git-lfs-linux-amd64-v2.9.0.tar.gz  
rm git-lfs-linux-amd64-v2.9.0.tar.gz  
git lfs install
```

#### Clone the tink repo at the GOPATH
```shell script
mkdir -p ~/go/src/github.com/tinkerbell
cd ~/go/src/github.com/tinkerbell
git clone https://github.com/tinkerbell/tink.git && cd tink
git checkout demo-v2
cd demo
```

#### Export and persist the required environment variables
Edit the environment variables in `tinkenv` with your desired configurations if you wish.
```shell script
cat tinkenv >> ~/.bashrc
source ~/.bashrc
```

#### Run the setup script
The `setup.sh` script will configure the network, download necessary files, set up the certs and registry, and bring up the stack.  
The script is also separated into functions so you can rerun specific parts as needed.
```shell script
sudo ./setup.sh
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

For this demo, we are going to need action images for installing Ubuntu 18.04 onto the worker. 
The `create_images` script will build the images using the files under `workflow-samples/ubuntu` directory and push them to the registry.
```shell script
cd ~/go/src/github.com/tinkerbell/tink/demo/workflow-samples/ubuntu
./create_images.sh
```

### IV. Workflows

#### Pushing hardware data into database

1. Exec into the `tink_tink-cli_1` container.
2. Create a script to push hardware data into the database.
3. Export the necessary environment variables (`WORKER_MAC` and `WORKER_PLAN`).
4. Run the script.

```
$ docker exec -it tink_tink-cli_1 ash
<<<<<<< HEAD
/# vi /tmp/hardware.json
{"id": "hardware-uuid", "arch": "x86_64", "name": "node-name", "type": "node", "state": "provisioning", "vlan_id": 3210, "efi_boot": false, "instance": {"id": "instance-uuid", "tags": [], "state": "active", "rescue": false, "project": {"id": "project-uuid", "name": "Ops", "organization": {"id": "org-uuid", "name": "name"}, "primary_owner": {"id": "owner-uuid", "full_name": "owner-name"}}, "storage": {"disks": [{"device": "/dev/sda", "wipeTable": true, "partitions": [{"size": 4096, "label": "BIOS", "number": 1}, {"size": "3993600", "label": "SWAP", "number": 2}, {"size": 0, "label": "ROOT", "number": 3}]}], "filesystems": [{"mount": {"point": "/", "create": {"options": ["-L", "ROOT"]}, "device": "/dev/sda3", "format": "ext4"}}, {"mount": {"point": "none", "create": {"options": ["-L", "SWAP"]}, "device": "/dev/sda2", "format": "swap"}}]}, "hostname": "nginx-sandbox", "ssh_keys": [], "userdata": "", "allow_pxe": true, "always_pxe": true, "customdata": {}, "ip_addresses": [{"cidr": 31, "type": "data", "public": true, "address": "ip-address", "enabled": true, "gateway": "gateway, "netmask": "netmask", "network": "network", "management": true, "address_family": 4}, {"cidr": 127, "type": "data", "public": true, "address": "address", "enabled": true, "gateway": "gateway", "netmask": "netmask-hex", "network": "network", "management": true, "address_family": 6}, {"cidr": 31, "type": "data", "public": false, "address": "address", "enabled": true, "gateway": "gateway", "netmask": "netmask, "network": "network, "management": true, "address_family": 4}], "network_ready": true, "ipxe_script_url": null, "crypted_root_password": "crypted-root-password", "operating_system_version": {"slug": "ubuntu_16_04-t1.small.x86-09042018", "distro": "ubuntu", "os_slug": "ubuntu_16_04", "version": "16.04", "image_tag": "image-tag"}}, "services": {}, "allow_pxe": true, "plan_slug": "t1.small.x86", "allow_workflow":true, "management": {"type": "ipmi", "address": "192.168.1.5", "gateway": "192.168.1.1", "netmask": "255.255.255.240"}, "bonding_mode": 5, "ip_addresses": [{"cidr": 31, "type": "data", "public": false, "address": "172.16.1.35", "enabled": true, "gateway": "172.16.1.34", "netmask": "255.255.255.254", "network": "172.16.1.34", "management": true, "address_family": 4}, {"type": "ipmi", "address": "192.168.1.5", "gateway": "192.168.1.1", "netmask": "255.255.255.240"}], "manufacturer": {"id": "manufacturer-uuid", "slug": "supermicro"}, "facility_code": "nrt1", "network_ports": [{"id": "network-port-uuid", "data": {"mac": "mac", "bond": "bond0"}, "name": "eth0", "type": "data", "connected_ports": [{"id": "uuid", "data": {"mac": null, "bond": null},"name": "xe-0/0/10:0", "type": "data", "hostname": "hostname"}, {"id": "uuid", "data": {"mac": null, "bond": null}, "name": "xe-1/0/10:0", "type": "data", "hostname": "hostname"}]}, {"id": "uuid", "data": {"mac": "mac", "bond": "bond0"}, "name": "eth1", "type": "data", "connected_ports": [{"id": "port-uuid", "data": {"mac": null, "bond": null}, "name": "xe-0/0/10:2", "type": "data", "hostname": "hostname"}, {"id": "uuid", "data": {"mac": null, "bond": null}, "name": "xe-1/0/10:2", "type": "data", "hostname": "hostname"}]}, {"id": "uuid", "data": {"mac": "&lt;worker_mac_addr&gt;", "bond": null}, "name": "ipmi0", "type": "ipmi"}], "plan_version_slug": "baremetal_0_01", "preinstalled_operating_system_version": {}}

/# tink hardware push "`cat /tmp/hardware.json`"
=======
/# vi /tmp/push.sh
tink hardware push '{"id": "fde7c87c-d154-447e-9fce-7eb7bdec90c0", "arch": "x86_64", "name": "node2", "type": "node", "state": "provisioning", "vlan_id": 3210, "efi_boot": false, "instance": {"id": "947a6217-bffd-40ca-92d2-684b3986fdbc", "tags": [], "state": "active", "rescue": false, "project": {"id": "24248879-ec99-4c97-ac1d-375c0bf71ff6", "name": "Ops", "organization": {"id": "62a1ca67-b23c-4808-ac86-d19913ca7487", "name": "Packet"}, "primary_owner": {"id": "d3e2cc7e-0509-4f4e-beb9-07354091b518", "full_name": "Packet Bot"}}, "storage": {"disks": [{"device": "/dev/sda", "wipeTable": true, "partitions": [{"size": 4096, "label": "BIOS", "number": 1}, {"size": "3993600", "label": "SWAP", "number": 2}, {"size": 0, "label": "ROOT", "number": 3}]}], "filesystems": [{"mount": {"point": "/", "create": {"options": ["-L", "ROOT"]}, "device": "/dev/sda3", "format": "ext4"}}, {"mount": {"point": "none", "create": {"options": ["-L", "SWAP"]}, "device": "/dev/sda2", "format": "swap"}}]}, "hostname": "packet-test", "ssh_keys": [], "userdata": "", "allow_pxe": true, "always_pxe": true, "customdata": {}, "ip_addresses": [{"cidr": 31, "type": "data", "public": true, "address": "0.0.0.0", "enabled": true, "gateway": "0.0.0.0", "netmask": "255.255.255.254", "network": "0.0.0.0", "management": true, "address_family": 4}, {"cidr": 127, "type": "data", "public": true, "address": "2604:1380:3000:1100::1", "enabled": true, "gateway": "2604:1380:3000:1100::", "netmask": "ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffe", "network": "2604:1380:3000:1100::", "management": true, "address_family": 6}, {"cidr": 31, "type": "data", "public": false, "address": "", "enabled": true, "gateway": "0.0.0.0", "netmask": "255.255.255.254", "network": "0.0.0.0", "management": true, "address_family": 4}], "network_ready": true, "ipxe_script_url": null, "crypted_root_password": "", "operating_system_version": {"slug": "ubuntu_18_04-t1.small.x86-09042018", "distro": "ubuntu", "os_slug": "ubuntu_18_04", "version": "18.04", "image_tag": "7844cf38831a092c4c6eb712a2edd7349226dafd"}}, "services": {}, "allow_pxe": true, "plan_slug": "'$WORKER_PLAN'", "allow_workflow":true, "management": {"type": "ipmi", "address": "192.168.1.5", "gateway": "192.168.1.1", "netmask": "255.255.255.240"}, "bonding_mode": 5, "ip_addresses": [{"cidr": 31, "type": "data", "public": false, "address": "172.16.1.35", "enabled": true, "gateway": "172.16.1.34", "netmask": "255.255.255.254", "network": "172.16.1.34", "management": true, "address_family": 4}, {"type": "ipmi", "address": "192.168.1.5", "gateway": "192.168.1.1", "netmask": "255.255.255.240"}], "manufacturer": {"id": "f7dbf901-d210-4594-ab82-f529a36bdd70", "slug": "supermicro"}, "facility_code": "nrt1", "network_ports": [{"id": "7da65f4d-5d00-4270-9f6f-9959ebea2800", "data": {"mac": "0c:c4:7a:81:0b:5e", "bond": "bond0"}, "name": "eth0", "type": "data", "connected_ports": [{"id": "6c2f17e5-8517-4727-b9c7-115497a82ee3", "data": {"mac": null, "bond": null},
"name": "xe-0/0/10:0", "type": "data", "hostname": "test"}, {"id": "fcf4f876-f22d-40e6-a3fd-88826bc93a84", "data": {"mac": null, "bond": null}, "name": "xe-1/0/10:0", "type": "data", "hostname": "test"}]}, {"id": "3a112edd-300f-4e64-839b-ae9152925293", "data": {"mac": "0c:c4:7a:81:0b:5f", "bond": "bond0"}, "name": "eth1", "type": "data", "connected_ports": [{"id": "b7bb8ba9-e34d-439b-912b-b9ab0c3189bf", "data": {"mac": null, "bond": null}, "name": "xe-0/0/10:2", "type": "data", "hostname": "test"}, {"id": "35061d64-7b25-4d0b-9e15-164e513149e5", "data": {"mac": null, "bond": null}, "name": "xe-1/0/10:2", "type": "data", "hostname": "test"}]}, {"id": "356d1cf0-498f-46c6-b2e6-d5fdfdd5c5b3", "data": {"mac": "'$WORKER_MAC'", "bond": null}, "name": "ipmi0", "type": "ipmi"}], "plan_version_slug": "baremetal_0_01", "preinstalled_operating_system_version": {}}'

/# chmod +x /tmp/push.sh
/# export WORKER_MAC=<worker_mac_addr>
/# export WORKER_PLAN=<worker_plan_slug>
/# /tmp/push.sh
>>>>>>> a081323... restructured the instructions for better flow
/# tink hardware all
```


#### Creating a workflow
2. Exec into the `tink_tink-cli_1` container.
3. Create `target`, replacing `<worker_mac_addr>` with the actual worker MAC address.
4. Create `template`.
5. Create `workflow`.

```
$ docker exec -it tink_tink-cli_1 ash
/# tink target create '{"targets": {"machine1": {"mac_addr": "<worker_mac_addr>"}}}'
/# vi /tmp/ubuntu.tmpl
version: '0.1'
name: ubuntu_provisioning
global_timeout: 6000
tasks:
- name: "os-installation"
  worker: "{{index .Targets "machine1" "mac_addr"}}"
  volumes:
    - /dev:/dev
    - /dev/console:/dev/console
    - /lib/firmware:/lib/firmware:ro
  actions:
  - name: "disk-wipe"
    image: disk-wipe:v3
    timeout: 90
  - name: "disk-partition"
    image: disk-partition:v3
    timeout: 600
    environment:
       MIRROR_HOST: 192.168.1.2
    volumes:
      - /statedir:/statedir
  - name: "install-root-fs"
    image: install-root-fs:v3
    timeout: 600
    environment:
       MIRROR_HOST: 192.168.1.2
  - name: "install-grub"
    image: install-grub:v3
    timeout: 600
    environment:
       MIRROR_HOST: 192.168.1.2
    volumes:
      - /statedir:/statedir

/# tink template create -n 'ubuntu-template' -p /tmp/ubuntu.tmpl
/# tink workflow create -r <target_id> -t <template_id>
/# tink workflow get <workflow_id>
```
**Note:** For this demo, we are using the `ubuntu.tmpl` under `demo/workflow-samples/ubuntu`.  
For a more generalized example of what a template would look like, please reference `sample.tmpl` (which should already be located under `/tmp` inside the `tink_tink-cli_1` container). 

### V. Trigger the Workflow
1. Reboot `tf-worker`.
2. Use the Out-of-Band Console to connect with the worker machine and monitor progress.
3. On `tf-provisioner`, you can check on the workflow state and events using:
```
$ docker exec -it tink_tink-cli_1 ash
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
* Copy the ca.pem file over to the `/packet/nginx/workflow` directory (after rebuilding the certs container)

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