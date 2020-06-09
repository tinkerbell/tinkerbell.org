+++
title = "Vagrant"
date = 2020-06-08T16:16:15+05:30
draft = false
weight = 20
toc = true
+++

### Automated setup using Vagrant

- In this section we are going to create a provisioner and a worker using Vagrant.
- This guide supports two Vagrant providers - libvirt and VirtualBox.
- The setup uses a script that by default creates a [Hello World!](/examples/hello-world) workflow which helps in quickly testing the setup.

### Prerequisite

- Virtualization is enabled.

```
  grep -o 'vmx\|svm' /proc/cpuinfo
```

- Vagrant is installed.
- You may download and install Vagrant from the downloads page [here](https://www.vagrantup.com/downloads).

### Steps

- Install a Vagrant provider of your choice - libvirt or VirtualBox.
- For libvirt: install KVM, libvirt, QEMU and other dependencies.

```
sudo apt update && apt install qemu-kvm libvirt-clients libvirt-daemon-system bridge-utils libguestfs-tools virt-manager
```

- You can download and install VirtualBox and VirtualBox Extension Pack from their downloads page [here](https://www.virtualbox.org/wiki/Downloads).

- Create a directory to keep the artifacts.

```
mkdir -p vagrant && cd vagrant
```

- Get the artifacts.

```
# get automation script
curl -O https://raw.githubusercontent.com/tinkerbell/tink/master/deploy/vagrant/tinkerbell.sh

# libvirt Vagrantfile
curl -O https://raw.githubusercontent.com/tinkerbell/tink/master/deploy/vagrant/libvirt/Vagrantfile

# VirtualBox Vagrantfile
curl -O https://raw.githubusercontent.com/tinkerbell/tink/master/deploy/vagrant/virtualbox/Vagrantfile
```

- Get latest of OSIE. While this is optional, it can be really helpful.
  For more details, please check the environment variables [section](/setup/vagrant/script/#the-environment-variables) on the automation script page.

```
curl 'https://tinkerbell-oss.s3.amazonaws.com/osie-uploads/latest.tar.gz' -o osie.tar.gz
```

- Start the servers. This will create two virtual machines - provisioner and worker.

```
vagrant up provisioner
vagrant up worker
```

- When the provisioner is ready, a summary is printed to the console which consists of the Kibana endpoint to check the logs.
- As the worker starts it will fetch and execute the predefined `Hello World!` workflow.

### Connecting with the servers

- All the following commands are to be executed being in the directory created above, unless stated otherwise.
- You can connect with the provisioner using `ssh`.

```
vagrant ssh provisioner
```

- The credentials for provisioner are:

```
username: vagrant
password: vagrant
```

- In order to access the Tinkerbell components, `ssh` into provisioner and execute the following commands.

```
sudo su -l
cd tink && source envrc && cd deploy
docker-compose ps
```

- You can create as many workflows as you want for the same worker.
  However, for the worker to participate in those workflow you will need to restart the worker with following command.

```
# removes existing instance
vagrant destroy -f worker

# creates new instance with same MAC address
vagrant up worker
```

### The Script

- The important sections of the automation script used to bring up the Tinkerbell stack are explained [here](/setup/vagrant/script/).
- You can customize what happens when the stack is ready by adding your own steps to the script.
