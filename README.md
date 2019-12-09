# Tinkerbell

## Setup a Provisioner

### Create a server under OSS Provisioner
* Select - On Demand
* Hostname - `<unique>`
* Location - EWR1
* Type - c2.medium.x86
* OS - Ubuntu 18.04 LTS

### Set server network
* select 'convert to other network type'
* choose Mixed/Hybrid
* for Layer 2, add new VLAN
  * interface: eth1
  * network: provisioning-vlan

### SSH into server as root

```
$ ssh root@<server-IP>
```

### Add Packet nameservers

```
$ vi /etc/resolv.conf
nameserver 147.75.207.207
nameserver 147.75.207.208
```

### Add a static IP for an interface

```
$ vi /etc/network/interfaces
auto enp1s0f1
iface enp1s0f1 inet static
    address 192.168.1.1
    netmask 255.255.255.240

$ ifdown  enp1s0f1
$ ifup  enp1s0f1
$ ip a | grep -A 5 -B 2  enp1s0f1
```

### Update IP Tables

```
$ iptables -t nat -A POSTROUTING -s 192.168.1.1/28 -j MASQUERADE
```

### Setup Go
*Download Go*

```
$ wget https://dl.google.com/go/go1.12.13.linux-amd64.tar.gz
```
*Unpack*

```
	$ tar -C /usr/local -xzf go1.12.13.linux-amd64.tar.gz go/
	$ rm go1.12.13.linux-amd64.tar.gz
```
*Set environment*

```
$ mkdir -p ~/go ~/go/src
$ vi ~/.bashrc
export PATH=$PATH:/usr/local/go/bin
export GOPATH=$GOPATH:$HOME/go
export PATH=$PATH:$GOPATH
$ source ~/.bashrc
```

### Git

```
$ sudo apt update -y && sudo apt upgrade -y
$ apt install git -y
$ wget https://github.com/git-lfs/git-lfs/releases/download/v2.9.0/git-lfs-linux-amd64-v2.9.0.tar.gz
$ tar -C /usr/local/bin -xzf git-lfs-linux-amd64-v2.9.0.tar.gz
$ git lfs install
```

### Get Packet Components

```
$ cd ~/go/src
$ mkdir -p github.com github.com/packethost/
$ cd github.com/packethost/
$ git clone https://github.com/packethost/tinkerbell.git
$ git clone https://github.com/packethost/rover.git
```

*Cacher*

```
$ cd ~/go/src/github.com/packethost/cacher
$ git checkout rearrangement
$ make
```

*Tinkerbell*

```
$ cd ~/go/src/github.com/packethost/tinkerbell
$ git checkout demo
$ git lfs pull
$ make
```

*Rover*

```
$ cd ~/go/src/github.com/packethost/rover
$ git checkout demo
$ make
```

### Install Docker & DockerCompose

```
$ curl -L get.docker.com | bash
$ curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
$ chmod +x /usr/local/bin/docker-compose
```

### Setup NGINX
*Install NGINX*

```
$ apt install nginx -y
```

*Configure NGINX to listen at the IP and port*

```
$ vi /etc/nginx/sites-available/default
server {
        listen 192.168.1.1:8086 default_server;
        ...
}
$ service nginx restart
```

### Update Endpoints
* Update the hosts in `tls/server-csr.in.json` to have an entry for host IP

```
$ vi tls/server-csr.in.json
"hosts": [
    "rover.@FACILITY@.packet.net",
    "rover.registry",
    "rover.rover",
    "rover",
    "localhost",
    "127.0.0.1",
    "192.168.1.1"
  ],
```
* Update `fluent-bit.conf` with the host IP

```
$ sed -i -e "s/Host 0.0.0.0/HOST 192.168.1.1/g" fluent-bit.conf
```
* Update the docker-compose.yml file based on host IP added above.

```
sed -i -e "s/username/admin/g" docker-compose.yml
sed -i -e "s/password/pass/g" docker-compose.yml
sed -i -e "s/127.0.0.1:69/192.168.1.1:69/g" docker-compose.yml
sed -i -e "s/127.0.0.1:80/192.168.1.1:80/g" docker-compose.yml
sed -i -e "s/DNS_SERVERS: 8.8.8.8/DNS_SERVERS: '147.75.207.207,147.75.207.208'/g" docker-compose.yml
sed -i -e "s/PUBLIC_IP: 127.0.0.1/PUBLIC_IP: 192.168.1.1/g" docker-compose.yml
sed -i -e "s/BOOTP_BIND: 127.0.0.1:67/BOOTP_BIND: 192.168.1.1:67/g" docker-compose.yml
sed -i -e "s/SYSLOG_BIND: 127.0.0.1:514/SYSLOG_BIND: 192.168.1.1:514/g" docker-compose.yml
sed -i -e "s/DOCKER_REGISTRY: 127.0.0.1/DOCKER_REGISTRY: 192.168.1.1/g" docker-compose.yml
sed -i -e "s/ROVER_GRPC_AUTHORITY: 127.0.0.1:42113/ROVER_GRPC_AUTHORITY: 192.168.1.1:42113/g" docker-compose.yml
sed -i -e "s#ROVER_CERT_URL: http://127.0.0.1:42114/cert#ROVER_CERT_URL: http://192.168.1.1:42114/cert#g" docker-compose.yml
sed -i -e "s/ELASTIC_SEARCH_URL: 127.0.0.1:9200/ELASTIC_SEARCH_URL: 192.168.1.1:9200/g" docker-compose.yml
```
* Define a file to hold Packet environment variables:

```
$ vi ~/.packetrc
export FACILITY="onprem"
export PACKET_API_AUTH_TOKEN="<dummy_token>"
export PACKET_API_URL=""
export PACKET_CONSUMER_TOKEN="<dummy_token>"
export PACKET_ENV="onprem"
export PACKET_VERSION="onprem"
export ROLLBAR_TOKEN="<dummy_token>"
export ROLLBAR_DISABLE=1
export API_AUTH_TOKEN="<dummy_token>"
export API_CONSUMER_TOKEN="<dummy_token>"
export FACILITY_CODE=lab1
export PACKET_ENV=testing
export MIRROR_HOST=192.168.1.1:8086

$ echo 'source ~/.packetrc' >> ~/.bashrc
```

Ensure that you set `MIRROR_HOST` as the IP NGINX is listening on

```
$ source ~/.packetrc
```

### Start Services

```
$ cd ~/go/src/github.com/packethost/rover
$ docker-compose up -d --build elasticsearch fluentbit kibana
$ docker-compose up -d --build certs
$ docker-compose up -d --build registry
$ docker-compose up -d --build db server cli tinkerbell
$ docker-compose ps
```
**Note:** The certs service must have an Exit(0) status. Also, there should be a new certs directory that holds all the certificates.

### Update Host to trust Registry Certificate

```
$ mkdir -p /etc/docker/certs.d /etc/docker/certs.d/192.168.1.1
$ cp certs/ca.pem /etc/docker/certs.d/192.168.1.1/ca.crt
$ docker login 192.168.1.1 -u admin -p pass
```
**Note:** If there is an error saving the credentials, the following command will fix the issue. However, I’m not certain if this is recommended.

```
$ apt purge golang-docker-credential-helpers
```

### Worker Image

```
$ cd ~/go/src/github.com/packethost/rover/worker
$ docker build -t 192.168.1.1/worker .
$ docker push 192.168.1.1/worker
```

### Action Images
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
$ cd worker && docker build -t 192.168.1.1/worker .
$ docker push 192.168.1.1/worker
```

### Setup Osie

Create the following directories:

```
$ cd /var/www/html/
$ mkdir -p ipxe misc misc/osie misc/tinkerbell misc/tinkerbell/workflow
```
Copy the registry certificate:

```
$ cp ~/go/src/github.com/packethost/rover/certs/ca.pem misc/tinkerbell/workflow/
$ cp ~/go/src/github.com/packethost/rover/certs/server.pem misc/tinkerbell/workflow/
```
Get the build for workflow branch and place the required files under `/var/www/html/misc/osie/current` and `/var/www/html/misc/tinkerbell/workflow` directories

```
$ cd /var/www/html/misc/osie
$ wget http://install.ewr1.packet.net/misc/osie/current.tar.gz
$ tar -zxf current.tar.gz
$ mv osie-v19.08.28.00-n\=8\,c\=b47f876\,b\=master/ current
$ cp workflow-helper-rc workflow-helper.sh /var/www/html/misc/tinkerbell/workflow/
```

### Pushing hardware data into database

```
$ docker exec -it rover_cli_1 ash
/# vi /tmp/hardware.json
'{"id": "fde7c87c-d154-447e-9fce-7eb7bdec90c0", "arch": "x86_64", "name": "node2", "type": "node", "state": "provisioning", "vlan_id": 3210, "efi_boot": false, "instance": {"id": "947a6217-bffd-40ca-92d2-684b3986fdbc", "tags": [], "state": "active", "rescue": false, "project": {"id": "24248879-ec99-4c97-ac1d-375c0bf71ff6", "name": "Ops", "organization": {"id": "62a1ca67-b23c-4808-ac86-d19913ca7487", "name": "Packet"}, "primary_owner": {"id": "d3e2cc7e-0509-4f4e-beb9-07354091b518", "full_name": "Packet Bot"}}, "storage": {"disks": [{"device": "/dev/sda", "wipeTable": true, "partitions": [{"size": 4096, "label": "BIOS", "number": 1}, {"size": "3993600", "label": "SWAP", "number": 2}, {"size": 0, "label": "ROOT", "number": 3}]}], "filesystems": [{"mount": {"point": "/", "create": {"options": ["-L", "ROOT"]}, "device": "/dev/sda3", "format": "ext4"}}, {"mount": {"point": "none", "create": {"options": ["-L", "SWAP"]}, "device": "/dev/sda2", "format": "swap"}}]}, "hostname": "packet-test", "ssh_keys": [], "userdata": "", "allow_pxe": true, "always_pxe": true, "customdata": {}, "ip_addresses": [{"cidr": 31, "type": "data", "public": true, "address": "0.0.0.0", "enabled": true, "gateway": "0.0.0.0", "netmask": "255.255.255.254", "network": "0.0.0.0", "management": true, "address_family": 4}, {"cidr": 127, "type": "data", "public": true, "address": "2604:1380:3000:1100::1", "enabled": true, "gateway": "2604:1380:3000:1100::", "netmask": "ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffe", "network": "2604:1380:3000:1100::", "management": true, "address_family": 6}, {"cidr": 31, "type": "data", "public": false, "address": "", "enabled": true, "gateway": "0.0.0.0", "netmask": "255.255.255.254", "network": "0.0.0.0", "management": true, "address_family": 4}], "network_ready": true, "ipxe_script_url": null, "crypted_root_password": "", "operating_system_version": {"slug": "ubuntu_16_04-t1.small.x86-09042018", "distro": "ubuntu", "os_slug": "ubuntu_16_04", "version": "16.04", "image_tag": "7844cf38831a092c4c6eb712a2edd7349226dafd"}}, "services": {}, "allow_pxe": true, "plan_slug": "t1.small.x86", "allow_workflow":true, "management": {"type": "ipmi", "address": "192.168.1.5", "gateway": "192.168.1.1", "netmask": "255.255.255.240"}, "bonding_mode": 5, "ip_addresses": [{"cidr": 31, "type": "data", "public": false, "address": "172.16.1.35", "enabled": true, "gateway": "172.16.1.34", "netmask": "255.255.255.254", "network": "172.16.1.34", "management": true, "address_family": 4}, {"type": "ipmi", "address": "192.168.1.5", "gateway": "192.168.1.1", "netmask": "255.255.255.240"}], "manufacturer": {"id": "f7dbf901-d210-4594-ab82-f529a36bdd70", "slug": "supermicro"}, "facility_code": "nrt1", "network_ports": [{"id": "7da65f4d-5d00-4270-9f6f-9959ebea2800", "data": {"mac": "0c:c4:7a:81:0b:5e", "bond": "bond0"}, "name": "eth0", "type": "data", "connected_ports": [{"id": "6c2f17e5-8517-4727-b9c7-115497a82ee3", "data": {"mac": null, "bond": null},
"name": "xe-0/0/10:0", "type": "data", "hostname": "test"}, {"id": "fcf4f876-f22d-40e6-a3fd-88826bc93a84", "data": {"mac": null, "bond": null}, "name": "xe-1/0/10:0", "type": "data", "hostname": "test"}]}, {"id": "3a112edd-300f-4e64-839b-ae9152925293", "data": {"mac": "0c:c4:7a:81:0b:5f", "bond": "bond0"}, "name": "eth1", "type": "data", "connected_ports": [{"id": "b7bb8ba9-e34d-439b-912b-b9ab0c3189bf", "data": {"mac": null, "bond": null}, "name": "xe-0/0/10:2", "type": "data", "hostname": "test"}, {"id": "35061d64-7b25-4d0b-9e15-164e513149e5", "data": {"mac": null, "bond": null}, "name": "xe-1/0/10:2", "type": "data", "hostname": "test"}]}, {"id": "356d1cf0-498f-46c6-b2e6-d5fdfdd5c5b3", "data": {"mac": "<worker_mac_addr>", "bond": null}, "name": "ipmi0", "type": "ipmi"}], "plan_version_slug": "baremetal_0_01", "preinstalled_operating_system_version": {}}'

/# rover hardware push "`cat /tmp/hardware.json`"
/# rover hardware all
```
**Note:** Replace `<worker_mac_addr>` in `/tmp/hardware.json` with the worker's MAC address.

### Creating a workflow

```
$ docker exec -it rover_cli_1 ash
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
    on-timeout: "rover_client update-timeout"
    on-failure: "rover_client update-failed"

/# rover template create -n 'template_name' -p /tmp/sample.tmpl
/# rover workflow create -r <target_id> -t <template_id>
```

## Setup Worker
### Create a server under OSS Provisioner
* Select - On Demand
* Hostname - `<unique>`
* Location - EWR1
* Type - c2.medium.x86
* OS - Custom iPXE

### Server Network
* select 'convert to other network type'
* choose Layer 2 type
* among Bonded and Individual, select Individual
* add new VLAN
* interface: eth0
* network: provisioning-vlan
* enable always PXE boot

### Connect
Use the Out-of-Band Console to connect with the server:

```
$ ssh d764666a-fd80-4e15-8042-7cf0e254718e@sos.ewr1.packet.net
```

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

* Not copying the ca.pem and server.pem files over to the `misc/tinkerbell/workflow` directory (after rebuilding the certs container)

```
Waiting for docker to respond...
WARNING! Using --password via the CLI is insecure. Use --password-stdin.
Error response from daemon: Get https://192.168.1.1/v2/: x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "Autogenerated CA")
```

