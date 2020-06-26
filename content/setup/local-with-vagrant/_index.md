+++
title = "Local with Vagrant"
date = 2020-06-08T16:16:15+05:30
draft = false
weight = 20
toc = true
+++

This easiest way to try out Tinkerbell locally is by using [Vagrant](https://www.vagrantup.com).

This tutorial will show you how to use Vagrant to setup a provisioner and a worker
ready to handle actions and workflows.

## Prerequisites

- [The host's processor should support virtualization](https://www.cyberciti.biz/faq/linux-xen-vmware-kvm-intel-vt-amd-v-support/)
- [Vagrant](https://www.vagrantup.com/downloads) is installed
- Either [VirtualBox](https://www.virtualbox.org/) or [libvirtd](https://libvirt.org/) is installed and configured.

## Cloning Tinkerbell

Clone `tink` and move into the `deploy/vagrant` directory. This folder contains
a Vagrant configuration file (Vagrantfile) and the scripts needed to setup the provisioner
and the worker.

```
$ git clone https://github.com/tinkerbell/tink.git
$ cd tink/deploy/vagrant
```

## Start the provisioner

```
$ vagrant up provisioner
Bringing machine 'provisioner' up with 'virtualbox' provider...

    ......

    INFO: tinkerbell stack setup completed successfully on ubuntu server
    NEXT: 1. Enter /vagrant/deploy and run: source ../envrc; docker-compose up -d
          2. Try executing your fist workflow.
              Follow the steps described in https://tinkerbell.org/examples/hello-world/ to say 'Hello World!' with a workflow.
```

When the provisioner is ready, you'll see the summary above and you can continue.

### Connecting to the Provisioner

Connect to the provisioner via `vagrant ssh`:

```
$ vagrant ssh provisioner
vagrant@provisioner:~$
```

At this point, you are in an Ubuntu box that has a couple of utils installed.

Let's now start up the Tinkerbell stack with `docker-compose`:

```
vagrant@provisioner:/vagrant/deploy$ cd /vagrant && source envrc && cd deploy
vagrant@provisioner:/vagrant/deploy$ docker-compose up -d
```

{{% notice note %}}
This is now managed like a standard Docker Compose project. Just make sure to have sourced the `envrc` before issuing `docker-compose` commands.
{{% /notice %}}

You now have a fully working provisioner that is ready to receive templates and
workflows. Check that all the services are running:

```
vagrant@provisioner:/vagrant/deploy$ docker-compose ps
        Name                      Command                  State                             Ports
-------------------------------------------------------------------------------------------------------------------------
deploy_boots_1         /boots -dhcp-addr 0.0.0.0: ...   Up
deploy_db_1            docker-entrypoint.sh postgres    Up (healthy)   0.0.0.0:5432->5432/tcp
deploy_hegel_1         cmd/hegel                        Up
deploy_nginx_1         /docker-entrypoint.sh ngin ...   Up             192.168.1.2:80->80/tcp
deploy_registry_1      /entrypoint.sh /etc/docker ...   Up (healthy)
deploy_tink-cli_1      /bin/sh -c sleep infinity        Up
deploy_tink-server_1   tink-server                      Up (healthy)   0.0.0.0:42113->42113/tcp, 0.0.0.0:42114->42114/tcp
```

### Register the worker's hardware

Now that the provisioner is running we can follow the [example called "Hello
world"](/examples/hello-world). We will run through it for our Vagrant setup
here.

It is useful to keep a an eye on the logs from the Tinkerbell
provisioner, because it helps to see what it is doing. Open a new terminal,
ssh in the provisioner as we did before and run `docker-compose` to tail logs:

```
$ vagrant ssh provisioner
$ cd /vagrant/deploy
vagrant@provisioner:/vagrant/deploy $ source ../envrc
vagrant@provisioner:/vagrant/deploy $ docker-compose logs -f tink-server boots nginx
```

Later in the tutorial we will check the logs from `tink-server` in order to
visualize the execution of the workflow.

Now we define our hello world template and load it into Tinkerbell:

```
vagrant@provisioner:/vagrant/deploy$ cat > hello-world.yml  <<EOF
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
EOF

vagrant@provisioner:/vagrant/deploy$ docker exec -i deploy_tink-cli_1 tink template create --name hello-world < ./hello-world.yml
Created Template:  75ab8483-6f42-42a9-a80d-a9f6196130df
```

Next we register the worker with Tinkerbell:

```
vagrant@provisioner:/vagrant/deploy$ cat > hardware-data.json <<EOF
{
  "id": "0eba0bf8-3772-4b4a-ab9f-6ebe93b90a94",
  "metadata": {
    "facility": {
      "facility_code": "onprem"
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
          "mac": "08:00:27:00:00:01",
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
EOF

vagrant@provisioner:/vagrant/deploy$ docker exec -i deploy_tink-cli_1 tink hardware push < ./hardware-data.json
2020/06/17 14:12:45 Hardware data pushed successfully
```

As the "Hello World" example suggests, we have to bridge the action from Docker
Hub to the internal registry:

```
vagrant@provisioner:/vagrant/deploy$ docker pull hello-world
vagrant@provisioner:/vagrant/deploy$ docker tag hello-world 192.168.1.1/hello-world
vagrant@provisioner:/vagrant/deploy$ docker push 192.168.1.1/hello-world
```

Now that we have our template and hardware data registered we can trigger the
workflow for that particular hardware on our worker, but first let's look at what we just did:

1. A template is used to create workflows. Templates are important because you
   can create as many workflows as you need from a single template.
2. A workflow needs a target, defined by the hardware data. In this Vagrant example
   it is the worker node that we will start shortly, and it is identified by a MAC address.

Let's start the workflow where:

- `-t` is the template ID you got when registering your template. (in this
  example: `75ab8483-6f42-42a9-a80d-a9f6196130df`)
- `-r` contains the variables to replace in the template, in
  this case only the worker's MAC address is required:

```
vagrant@provisioner:/vagrant/deploy$ docker exec -i deploy_tink-cli_1 tink workflow create \
    -t <TEMPLATE ID> \
    -r '{"device_1":"08:00:27:00:00:01"}'
Created Workflow:  a8984b09-566d-47ba-b6c5-fbe482d8ad7f
```

{{% notice note %}}
This MAC address is hard coded in the Vagrantfile.
{{% /notice %}}

Now finally we can spin up our worker with Vagrant.

## Start a worker

For a worker the MAC address works as a unique identifier, with Vagrant we are
able to set it to fixed value, in this case `080027000001`.

As you did for the provisioner start the worker with Vagrant in a new terminal:

```
$ cd deploy/vagrant
$ vagrant up worker
```

If using VirtualBox, the worker shows up in a UI. If you followed all the steps
correctly, Tinkerbell will netboot a custom AlpineOS and you will see a login screen.
This OS runs in RAM, so any changes you make won't be persisted between reboots.

You can login with the username `root` and no password is required.

![Screenshot from the worker](/images/vagrant-setup-vbox-worker.png)

{{% notice note %}}
If you have a 4k monitor, here are a few notes about how to make the [UI bigger](https://github.com/tinkerbell/tinkerbell.org/pull/76#discussion_r442151095).
{{% /notice %}}

In the meantime, if you look back at the terminal where you are tailing the logs
from the Tinkerbell provisioner, you will see the workflow running:

```
tink-server_1  | Received action status: workflow_id:"a8984b09-566d-47ba-b6c5-fbe482d8ad7f" task_name:"hello world" action_name:"hello_world" action_status:ACTION_SUCCESS message:"Finished Execution Successfully" worker_id:"ce2e62ed-826f-4485-a39f-a82bb74338e2"
tink-server_1  | Current context workflow_id:"a8984b09-566d-47ba-b6c5-fbe482d8ad7f" current_worker:"ce2e62ed-826f-4485-a39f-a82bb74338e2" current_task:"hello world" current_action:"hello_world" current_action_state:ACTION_SUCCESS total_number_of_actions:1
```

To double check it you can use from the provisioner the tink-cli:

```
vagrant@provisioner:/vagrant/deploy$ docker exec -i deploy_tink-cli_1 tink workflow events a8984b09-566d-47ba-b6c5-fbe482d8ad7f
+--------------------------------------+-------------+-------------+----------------+---------------------------------+--------------------+
| WORKER ID                            | TASK NAME   | ACTION NAME | EXECUTION TIME | MESSAGE                         |      ACTION STATUS |
+--------------------------------------+-------------+-------------+----------------+---------------------------------+--------------------+
| ce2e62ed-826f-4485-a39f-a82bb74338e2 | hello world | hello_world |              0 | Started execution               | ACTION_IN_PROGRESS |
| ce2e62ed-826f-4485-a39f-a82bb74338e2 | hello world | hello_world |              0 | Finished Execution Successfully |     ACTION_SUCCESS |
+--------------------------------------+-------------+-------------+----------------+---------------------------------+--------------------+
```

That's it! Let us know what you think about it on [Slack](/community-slack).
