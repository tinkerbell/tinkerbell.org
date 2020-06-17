+++
title = "Local with Vagrant"
date = 2020-06-08T16:16:15+05:30
draft = false
weight = 20
toc = true
+++

An easy way to try out Tinkerbell locally is via [Vagrant](https://www.vagrantup.com).

Vagrant wraps and glue together different technologies to help you write as
code repetitive environment mixing virtualization or cloud providers such as
VirtualBox, libvirt, AWS, GCP with provisioning techniques like Puppet, Ansible,
Bash.

In this context we use VirtualBox or libvirt as a virtualization platform and
bash for provisioning all the required tools and configurations.

Following this tutorial you will end up with a provisioner up and running and a
worker ready to handle actions and workflows.

## Prerequisite

A bunch of information you have to know and tools you have to install in order
to be up and running with the following tutorial.

### Ubuntu/Debian

1. Check if the CPU virtualization is enabled.

```
$ grep -o 'vmx\|svm' /proc/cpuinfo
```

2. You may download and install Vagrant from the downloads page [here](https://www.vagrantup.com/downloads).

3. Install a Vagrant provider of your choice — libvirt or VirtualBox.

3a. For libvirt: install KVM, libvirt, QEMU and other dependencies.

```
$ sudo apt update && apt install qemu-kvm libvirt-clients libvirt-daemon-system bridge-utils libguestfs-tools virt-manager
```

3b. You can download and install VirtualBox and VirtualBox Extension Pack from their downloads page [here](https://www.virtualbox.org/wiki/Downloads).

### macOS

1. You can use brew to install VirtualBox and Vagrant.

```
$ brew cask install virtualbox
$ brew cask install vagrant
```

2. The worker will start with UI enabled, the first time it will ask for
   VirtualBox permissions around "Input Monitoring". It is expected just allow
   them.

## Project foldering

1. Clone `tink` and move inside `deploy/vagrant` directory. This folder contains
   vagrant configuration (Vagrantfile) and the scripts needed to provision
   workers and provisioner.

```
$ git clone https://github.com/tinkerbell/tink.git
$ cd tink/deploy/vagrant
```

## Start the provisioner

```
$ vagrant up provisioner
Bringing machine 'provisioner' up with 'virtualbox' provider...
==> provisioner: Importing base box 'generic/ubuntu1804'...
==> provisioner: Matching MAC address for NAT networking...
==> provisioner: Checking if box 'generic/ubuntu1804' version '3.0.10' is up to date...
==> provisioner: Setting the name of the VM: tink-vagrant_provisioner_1592388207301_7361
==> provisioner: Clearing any previously set network interfaces...
==> provisioner: Preparing network interfaces based on configuration...
    provisioner: Adapter 1: nat
    provisioner: Adapter 2: hostonly
==> provisioner: Forwarding ports...
    provisioner: 22 (guest) => 2222 (host) (adapter 1)
==> provisioner: Running 'pre-boot' VM customizations...
==> provisioner: Booting VM...
==> provisioner: Waiting for machine to boot. This may take a few minutes...
    provisioner: SSH address: 127.0.0.1:2222
    provisioner: SSH username: vagrant
    provisioner: SSH auth method: private key
    provisioner:
    provisioner: Vagrant insecure key detected. Vagrant will automatically replace
    provisioner: this with a newly generated keypair for better security.
    provisioner:
    provisioner: Inserting generated public key within guest...
    provisioner: Removing insecure key from the guest if it's present...
    provisioner: Key inserted! Disconnecting and reconnecting using new SSH key...
==> provisioner: Machine booted and ready!
==> provisioner: Checking for guest additions in VM...
==> provisioner: Setting hostname...
==> provisioner: Configuring and enabling network interfaces...
==> provisioner: Rsyncing folder: /Users/name/git/tink/ => /vagrant
==> provisioner: Running provisioner: shell...
    provisioner: Running: /var/folders/0_/841vr1ms57s65r7h1_2vm69m0000gn/T/vagrant-shell20200617-5179-181phru.sh
    provisioner: + whoami
    provisioner: root
    provisioner: + cd /vagrant
    provisioner: + main
    provisioner: + export DEBIAN_FRONTEND=noninteractive
    provisioner: + DEBIAN_FRONTEND=noninteractive
    provisioner: + apt-get update
    provisioner: Hit:1 http://us.archive.ubuntu.com/ubuntu bionic InRelease
    provisioner: Get:2 http://security.ubuntu.com/ubuntu bionic-security InRelease [88.7 kB]
    provisioner: Get:3 http://us.archive.ubuntu.com/ubuntu bionic-updates InRelease [88.7 kB]
    provisioner: Get:4 http://security.ubuntu.com/ubuntu bionic-security/main amd64 Packages [748 kB]
    provisioner: Get:5 http://us.archive.ubuntu.com/ubuntu bionic-backports InRelease [74.6 kB]
    provisioner: Get:6 http://us.archive.ubuntu.com/ubuntu bionic-updates/main amd64 Packages [970 kB]
    provisioner: Get:7 http://security.ubuntu.com/ubuntu bionic-security/main i386 Packages [486 kB]
    provisioner: Get:8 http://security.ubuntu.com/ubuntu bionic-security/main Translation-en [237 kB]
    provisioner: Get:9 http://security.ubuntu.com/ubuntu bionic-security/restricted amd64 Packages [50.8 kB]

    ......

    provisioner: 1.3: digest: sha256:4a83e24146c332f4d2a821afd4bdfabc7a72e501a3610170db0359dcc6c44e3d size: 3677
    provisioner: INFO: tinkerbell stack setup completed successfully on ubuntu server
    provisioner: NEXT: 1. Enter ./deploy and run: source ../envrc; docker-compose up
    provisioner:        2. Try executing your fist workflow.
    provisioner:           Follow the steps described in https://tinkerbell.org/examples/hello-world/ to say 'Hello World!' with a workflow.
    provisioner: + secure_certs
    provisioner: + local certdir=/etc/docker/certs.d/192.168.1.1
    provisioner: + sudo chown root /etc/docker/certs.d/192.168.1.1
    provisioner: + configure_vagrant_user
    provisioner: + sudo usermod -aG docker vagrant
    provisioner: + echo -n 3785862bf9af42b709634d40bd96aa27580382c5b94b695d42676bb201e902d5
    provisioner: + sudo -iu vagrant docker login --username=admin --password-stdin 192.168.1.1
    provisioner: WARNING! Your password will be stored unencrypted in /home/vagrant/.docker/config.json.
    provisioner: Configure a credential helper to remove this warning. See
    provisioner: https://docs.docker.com/engine/reference/commandline/login/#credentials-store

    Login Succeeded
    latest: Pulling from tinkerbell/tink-worker
    Digest: sha256:55c99b7cfafd28244fd3f7adbe46d94ada305f0f28553f95dfd241c168f0439e
    Status: Image is up to date for quay.io/tinkerbell/tink-worker:latest
    quay.io/tinkerbell/tink-worker:latest
    The push refers to repository [192.168.1.1/tink-worker]
    c83ceae18bd4: Layer already exists
    a1872780b5d4: Layer already exists
    3e207b409db3: Layer already exists
    latest: digest: sha256:55c99b7cfafd28244fd3f7adbe46d94ada305f0f28553f95dfd241c168f0439e size: 949
    INFO: tinkerbell stack setup completed successfully on ubuntu server
    NEXT: 1. Enter ./deploy and run: source ../envrc; docker-compose up
           2. Try executing your fist workflow.
              Follow the steps described in https://tinkerbell.org/examples/hello-world/ to say 'Hello World!' with a workflow.
```

When the provisioner is ready, a summary is printed to the console and you can
now ssh in.

### Connecting with the servers

All the following commands are to be executed being in the artifacts' directory created
above, unless stated otherwise.

Connect to the provisioner via ssh, vagrant has an until:

```
$ vagrant ssh provisioner
vagrant@provisioner:~$
```

At this point you are in an Ubuntu box that has a couple of utils installed and
it is not time to start the services to make it a proper Tinkerbell provisioner

```
$ sudo su -l
$ cd /vagrant && source envrc && cd deploy
$ docker-compose up -d
```

!TIPS The important sections of the automation script used to bring up the
Tinkerbell stack are explained [here](/setup/vagrant/script/).

When you are done with these commands you have a fully working provisioner that
is ready to receive templates and workflow targeting workers. You can check that
running:

```
$ docker-compose ps
        Name                      Command                  State                             Ports
-------------------------------------------------------------------------------------------------------------------------
deploy_boots_1         /boots -dhcp-addr 0.0.0.0: ...   Up
deploy_cacher_1        /cacher                          Up             0.0.0.0:42111->42111/tcp, 0.0.0.0:42112->42112/tcp
deploy_db_1            docker-entrypoint.sh postgres    Up (healthy)   0.0.0.0:5432->5432/tcp
deploy_hegel_1         cmd/hegel                        Up
deploy_nginx_1         /docker-entrypoint.sh ngin ...   Up             192.168.1.2:80->80/tcp
deploy_registry_1      /entrypoint.sh /etc/docker ...   Up (healthy)
deploy_tink-cli_1      /bin/sh -c sleep infinity        Up
deploy_tink-server_1   tink-server                      Up (healthy)   0.0.0.0:42113->42113/tcp, 0.0.0.0:42114->42114/tcp
```

### Configure worker hardware

At this point the provisioner is running and we can follow the [example called
"Hello world"](/examples/hello-world) but I will contextualize it for our vagrant
setup here.

SSH in the provisioner again and we have to define our hello world template and
load it to tinkerbell:

```
$ cat > hello-world.yml
version: "0.1"
name: hello_world_workflow
global_timeout: 600
tasks:
  - name: "hello world"
    worker: "{{.device_1}}"
    actions:
      - name: "hello_world"
        image: hello-world
        timeout: 60
$ docker exec -i deploy_tink-cli_1 tink template create --name hello-world < ./hello-world.yml
Created Template:  75ab8483-6f42-42a9-a80d-a9f6196130df
```

Now we have to register the future worker (hardware) to tinkerbell

```
$ cat > hardware-data.json
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
        "mac": "08:00:27:00:00:01"
      },
      "name": "eth0",
      "type": "data"
    }
  ]
}

$ docker exec -i deploy_tink-cli_1 tink hardware push < ./hardware-data.json
2020/06/17 14:12:45 Hardware data pushed successfully
```

Now that we have a template and hardware registered we can trigger the workflow
for that particular hardware but first a bit of context on what we just did:

1. A template is used to create workflows. Template are important because you
   can create as many workflows you need from a single template.
2. A workflow needs a target (a hardware) in vagrant it is the worker and it is
   identified via mac address.

Let's start the workflow where `-t` is the template ID you got when registering
your template and `-r` contains the variable that has to be replaced in the
template, in our case only the mac address for the worker is required:

```
$ docker exec -i deploy_tink-cli_1 tink workflow create \
    -t 75ab8483-6f42-42a9-a80d-a9f6196130df \
    -r '{"device_1":"08:00:27:00:00:01"}'
Created Workflow:  a8984b09-566d-47ba-b6c5-fbe482d8ad7f
```

At this point we need to spin up our first worker

## Start a worker

You can open a new terminal and get inside the `tink/deploy/vagrant`.

For a worker the mac address works as a unique identifier, with Vagrant we are
able to set it to `080027000001`. In this way you can rebuild it and it will
consistently get the same identifier.

As you did for the provisioner let's start the worker via vagrant:

```
$ vagrant up worker
```

If using VirtualBox, the worker shows up in a UI and if everything is right you
should see at the end of the boot a login to a custom Alpine that tinkerbell
netboot and it currently runs in RAM. You can login with the username `root` and
it does not require any password.

![](/images/vagrant-setup-vbox-worker.png)

That's it! Let us know what you think about it on [Slack](/community-slack).
