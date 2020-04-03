# Tinkerbell

# Creating Set Up 

## Complete Setup With Terraform

 - Clone the `tink` repository for latest code:
```shell
$ git clone https://github.com/tinkerbell/tink.git
$ cd tink/terraform
```

 - Update the `input.tf` file with desired values 
 - Add your Packet `auth_token` in `input.tf`
 - Run the following commands
```shell
$ terraform init
$ terraform apply
``` 

The above commands will create a complete setup with `tf-provisioner` and `tf-worker` machines for the `packet` provider on which you can run any workflow. As an output it returns the IP address of the provisioner and MAC address of the worker machine.


***_Note_ :*** The default names of machines created by Terraform are `tf-provisioner` and `tf-worker`. If you prefer other names, you need to replace `tf-provisioner` and `tf-worker` with the new ones at all places in `main.tf`.



## Setup without Terraform on two existing machines

## 1. Setup Provisioner machine

 ### 1.1. Setup git and git lfs
    ```shell
    $ sudo apt install -y git  
    $ wget https://github.com/git-lfs/git-lfs/releases/download/v2.9.0/git-lfs-linux-amd64-v2.9.0.tar.gz  
    $ tar -C /usr/local/bin -xzf git-lfs-linux-amd64-v2.9.0.tar.gz  
    $ rm git-lfs-linux-amd64-v2.9.0.tar.gz  
    $ git lfs install  

### 1.2. Setup go
    ```shell
    $ wget https://dl.google.com/go/go1.13.9.linux-amd64.tar.gz
    $ tar -C /usr/local -xzf go1.13.9.linux-amd64.tar.gz go/
    $ rm go1.13.9.linux-amd64.tar.gz

### 1.3. Set GOPATH
  ```
    $ echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
    $ echo 'export GOPATH=$GOPATH:$HOME/go' >> ~/.bashrc
    $ echo 'export PATH=$PATH:$GOPATH' >> ~/.bashrc
    $ source ~/.bashrc
  ```
### 1.4. Install docker and docker-compose as follows:
  ```
    $ curl -L get.docker.com | bash
    $ curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    $ chmod +x /usr/local/bin/docker-compose  
  ```
### 1.5. Clone the tink repo in the $GOPATH
  ```
    $ mkdir -p ~/go/src/github.com/tinkerbell
    $ cd ~/go/src/github.com/tinkerbell
    $ git clone https://github.com/tinkerbell/tink.git
    $ cd tink
  ```
### 1.6. Provide the input details in "inputenv" file

### 1.7. Run the following command
  ```
    $ sudo ./setup_with_docker_compose.sh
  ```  
**Note:** If there is an error saving the credentials, the following command will fix the issue. However, I’m not certain if this is recommended.

```
$ apt purge golang-docker-credential-helpers
```

## Action Images
The registry must have an image for all the actions in a workflow. To push an action image:

```
$ docker tag <action-image> <registry-host>/<action-image>
$ docker push <registry-host>/<action-image>
```
Example action images:

```
$ docker pull hello-world
$ docker tag hello-world 192.168.1.1/hello-world
$ docker push 192.168.1.1/hello-world
$ docker pull quay.io/tinkerbell/tink-worker:latest
$ docker tag  quay.io/tinkerbell/tink-worker:latest 192.168.1.1/tink-worker .
$ docker push 192.168.1.1/tink-worker
```

## Example of creating a Workflow

### Pushing hardware data into database

1. Create a file which has hardware data in json format and called as hardware.json just for example.
2. Copy this file to `tink_tink-cli_1` container in `/tmp` folder.
3. Get into `tink_tink-cli_1` container.

```
$ docker exec -it tink_tink-cli_1 ash
/# vi /tmp/hardware.json
'{"id": "fde7c87c-d154-447e-9fce-7eb7bdec90c0", "arch": "x86_64", "name": "node2", "type": "node", "state": "provisioning", "vlan_id": 3210, "efi_boot": false, "instance": {"id": "947a6217-bffd-40ca-92d2-684b3986fdbc", "tags": [], "state": "active", "rescue": false, "project": {"id": "24248879-ec99-4c97-ac1d-375c0bf71ff6", "name": "Ops", "organization": {"id": "62a1ca67-b23c-4808-ac86-d19913ca7487", "name": "Packet"}, "primary_owner": {"id": "d3e2cc7e-0509-4f4e-beb9-07354091b518", "full_name": "Packet Bot"}}, "storage": {"disks": [{"device": "/dev/sda", "wipeTable": true, "partitions": [{"size": 4096, "label": "BIOS", "number": 1}, {"size": "3993600", "label": "SWAP", "number": 2}, {"size": 0, "label": "ROOT", "number": 3}]}], "filesystems": [{"mount": {"point": "/", "create": {"options": ["-L", "ROOT"]}, "device": "/dev/sda3", "format": "ext4"}}, {"mount": {"point": "none", "create": {"options": ["-L", "SWAP"]}, "device": "/dev/sda2", "format": "swap"}}]}, "hostname": "packet-test", "ssh_keys": [], "userdata": "", "allow_pxe": true, "always_pxe": true, "customdata": {}, "ip_addresses": [{"cidr": 31, "type": "data", "public": true, "address": "0.0.0.0", "enabled": true, "gateway": "0.0.0.0", "netmask": "255.255.255.254", "network": "0.0.0.0", "management": true, "address_family": 4}, {"cidr": 127, "type": "data", "public": true, "address": "2604:1380:3000:1100::1", "enabled": true, "gateway": "2604:1380:3000:1100::", "netmask": "ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffe", "network": "2604:1380:3000:1100::", "management": true, "address_family": 6}, {"cidr": 31, "type": "data", "public": false, "address": "", "enabled": true, "gateway": "0.0.0.0", "netmask": "255.255.255.254", "network": "0.0.0.0", "management": true, "address_family": 4}], "network_ready": true, "ipxe_script_url": null, "crypted_root_password": "", "operating_system_version": {"slug": "ubuntu_16_04-t1.small.x86-09042018", "distro": "ubuntu", "os_slug": "ubuntu_16_04", "version": "16.04", "image_tag": "7844cf38831a092c4c6eb712a2edd7349226dafd"}}, "services": {}, "allow_pxe": true, "plan_slug": "t1.small.x86", "allow_workflow":true, "management": {"type": "ipmi", "address": "192.168.1.5", "gateway": "192.168.1.1", "netmask": "255.255.255.240"}, "bonding_mode": 5, "ip_addresses": [{"cidr": 31, "type": "data", "public": false, "address": "172.16.1.35", "enabled": true, "gateway": "172.16.1.34", "netmask": "255.255.255.254", "network": "172.16.1.34", "management": true, "address_family": 4}, {"type": "ipmi", "address": "192.168.1.5", "gateway": "192.168.1.1", "netmask": "255.255.255.240"}], "manufacturer": {"id": "f7dbf901-d210-4594-ab82-f529a36bdd70", "slug": "supermicro"}, "facility_code": "nrt1", "network_ports": [{"id": "7da65f4d-5d00-4270-9f6f-9959ebea2800", "data": {"mac": "0c:c4:7a:81:0b:5e", "bond": "bond0"}, "name": "eth0", "type": "data", "connected_ports": [{"id": "6c2f17e5-8517-4727-b9c7-115497a82ee3", "data": {"mac": null, "bond": null},
"name": "xe-0/0/10:0", "type": "data", "hostname": "test"}, {"id": "fcf4f876-f22d-40e6-a3fd-88826bc93a84", "data": {"mac": null, "bond": null}, "name": "xe-1/0/10:0", "type": "data", "hostname": "test"}]}, {"id": "3a112edd-300f-4e64-839b-ae9152925293", "data": {"mac": "0c:c4:7a:81:0b:5f", "bond": "bond0"}, "name": "eth1", "type": "data", "connected_ports": [{"id": "b7bb8ba9-e34d-439b-912b-b9ab0c3189bf", "data": {"mac": null, "bond": null}, "name": "xe-0/0/10:2", "type": "data", "hostname": "test"}, {"id": "35061d64-7b25-4d0b-9e15-164e513149e5", "data": {"mac": null, "bond": null}, "name": "xe-1/0/10:2", "type": "data", "hostname": "test"}]}, {"id": "356d1cf0-498f-46c6-b2e6-d5fdfdd5c5b3", "data": {"mac": "<worker_mac_addr>", "bond": null}, "name": "ipmi0", "type": "ipmi"}], "plan_version_slug": "baremetal_0_01", "preinstalled_operating_system_version": {}}'

/# tink hardware push "`cat /tmp/hardware.json`"
/# tink hardware all
```
**Note :** Replace `<worker_mac_addr>` in `/tmp/hardware.json` with the worker's MAC address.


### Creating a workflow
1. Create a template as per the below example and named as sample.tmpl (or whatever you want).
2. Copy this template in `tink_tink-cli_1` container in `/tmp` folder and get into the container.
3. Create `target` as suggested in the following example
4. Create `template`
5. Create `workflow`

```
$ docker exec -it tink_tink-cli_1 ash
/# tink target create '{"targets": {"machine1": {"mac_addr": "&lt;worker_mac_addr&gt;"}}}'
/# vi /tmp/sample.tmpl
version: '0.1'
name: packet_osie_provision
global_timeout: 600
tasks:
- name: "OS Installation"
  worker: "{{index .Targets "machine1" "mac_addr"}}"
  actions:
  - name: "server_partitioning"
    image: hello-world
    timeout: 60
    on-timeout: do_partion recover -timeout
    on-failure: do_partion recover -failure
  - name: os_install
    image: hello-world
    timeout: 60
    on-timeout: "os_install -timeout"
    on-failure: "os_install -failure"
- name: "Updated DB Entries"
  worker: "{{index .Targets "machine1" "mac_addr"}}"
  actions:
  - name: "update_db"
    image: hello-world
    timeout: 50
    on-timeout: "tink_client update-timeout"
    on-failure: "tink_client update-failed"

/# tink template create -n 'template_name' -p /tmp/sample.tmpl
/# tink workflow create -r <target_id> -t <template_id>
```

## 2. Set up Worker Machine

* Hostname - `<unique>`
* Location - <same as provisioner>
* Type - <same as provisioner>
* OS - Custom iPXE

### Server Network
* select 'convert to other network type'
* choose Layer 2 type
* add new VLAN
* interface: eth0
* network: <same as provisioner machine>
* enable always PXE boot

### Connect
Use the Out-of-Band Console to connect with the worker machine:

---

## Mistakes to watch out for
* Not setting the worker to always PXE

```
PowerEdge R6415 - BIOS 1.8.7
A system restart is required. The system detected an exception during the UEFI
pre-boot environment.
```

* Not rebuilding the registry container after rebuilding the certs container

```
Login did not succeed, error: Error response from daemon: Get https://192.168.1.1/v2/: x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "Autogenerated CA")
```

* Not copying the ca.pem and server.pem files over to the `misc/boots/workflow` directory (after rebuilding the certs container)

```
Waiting for docker to respond...
WARNING! Using --password via the CLI is insecure. Use --password-stdin.
Error response from daemon: Get https://192.168.1.1/v2/: x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "Autogenerated CA")
```

