+++
title = "Packet with Terraform"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 30
toc = true
+++

## Intro

Using Terraform (with the Packet provider), create two servers _tf-provisioner_ and _tf-worker_ attached to the same VLAN.

The provisioner runs: `tink-server`, `boots`, `nginx to serve osie`, `hegel` and
Postgres.

First thins to do is to close the tink repository because it contains the
Terraform file required to spin up the environment:

```
git clone https://github.com/tinkerbell/tink.git
cd tink/deploy/terraform
```

This terraform module requires a couple of inputs, the mandatory one are the
`packet_api_token` and the `project_id`. You can pass those to `terraform`
command line tool via file, or inline with the flag `-var
"project_id=235-23452-245-345"`.

By default terraform load the `terraform.ftvars` when present. You can create one `terraform.tfvars` that looks like this:

```
$ cat terraform.tfvars
packet_api_token = "awegaga4gs4g"
project_id = "235-23452-245-345"
```

Make sure the API token is a user API token (created/accessed under _API keys_ in your personal settings)

Terraform uses your `ssh-agent` to connect to the provisioner when needed.
Double check that the right keys are set.

Run the following commands:

```
$ terraform init --upgrade
$ terraform apply

Apply complete! Resources: 5 added, 0 changed, 1 destroyed.

Outputs:

provisioner_dns_name = eef33e97.packethost.net
provisioner_ip = 136.144.56.237
worker_mac_addr = [
  "1c:34:da:42:d3:20",
]
worker_sos = [
  "4ac95ae2-6423-4cad-b91b-3d8c2fcf38d9@sos.dc13.packet.net",
]
```

{{% notice note %}}
As an output, it returns the IP address of the provisioner and MAC address of the worker machine.

The Worker SOS console helps you to follow what a worker is doing. You can ssh
in in and there is a section down this page about it.
{{% /notice %}}

## Setup the provisioner

Login via ssh into the provisioner and you will find yourself in a copy of the
tink repository:

```
$ ssh -t root@$(terraform output provisioner_ip) "cd /root/tink && bash"
```

You have to generate the `envrc`, a file that contains input
variable that will be used during the `setup` phase. The `envrc` gives us the
opportunity to create an idempotent workflow and for you is a way to configure
the `setup.sh` script. For example changing the [osie](/docs/services/osie) version.

```
$ ./generate-envrc.sh enp1s0f1 > envrc
$ source ./envrc
$ ./setup.sh
```

This script will use the `envrc` to boot:

* [tink-server](/docs/services/tink)
* [hegel](/docs/services/hegel)
* [boots](/docs/services/boots)
* postgres
* nginx to serve [osie](/docs/services/osie)
* A docker registry.

All those daemons will run with docker-compose and you can find the definition
of it in `tink/deploy/docker-compose.yaml`. Let's start them all:

```
$ cd ./deploy
$ docker-compose up -d
```

In order to check if all the services are up and running you can use
docker-compose as well, the output should look similar to this one:

```
$ docker-compose ps
        Name                      Command               State                         Ports
------------------------------------------------------------------------------------------------------------------
deploy_boots_1         /boots -dhcp-addr 0.0.0.0: ...   Up
deploy_db_1            docker-entrypoint.sh postgres    Up      0.0.0.0:5432->5432/tcp
deploy_hegel_1         cmd/hegel                        Up
deploy_nginx_1         /docker-entrypoint.sh ngin ...   Up      192.168.1.2:80->80/tcp
deploy_registry_1      /entrypoint.sh /etc/docker ...   Up
deploy_tink-cli_1      /bin/sh -c sleep infinity        Up
deploy_tink-server_1   tink-server                      Up      0.0.0.0:42113->42113/tcp, 0.0.0.0:42114->42114/tcp
```

The workers do not have access to internet, to run the Example Workflow
successfully we have to proxy a docker image called `hello-world` from Docker
Hub to the internal registry.

```
$ docker pull hello-world
$ docker tag hello-world 192.168.1.1/hello-world
$ docker push 192.168.1.1/hello-world
```

## Register the worker

As part of the `terraform apply` output we get the MAC address for the worker.
It is now time to register it to Tinkerbell. 

Terraform generates for us a file that contains the JSON describing the worker
just created:

```
$ cat /root/tink/deploy/hardware-data-0.json
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
          "mac": "1c:34:da:5c:36:88",
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

{{% notice note %}}
The mac address is the same we get from the Terraform output
{{% /notice %}}

Now we can push that definition to tink-server:

```
$ docker exec -i deploy_tink-cli_1 tink hardware push < /root/tink/deploy/hardware-data-0.json
> 2020/06/17 14:12:45 Hardware data pushed successfully
```

{{% notice note %}}
Ideally the worker should keep booting until a provisioner is ready to serve
Osie, but if it does not happen you manually reboot the worker via Packet API or
Packet UI. Remember to use the SOS console to check what the worker is doing.
{{% /notice %}}

## Create a template

Next, define the template for the workflow. The template sets out tasks for the
Worker to preform sequentially. This template contains a single task with a
single action, which is to perform [“hello-world”](/docs/examples/hello-world). Just as in the hello-world
example, the “hello-world” image doesn’t contain any instructions that the
Worker will perform. It is just a placeholder in the template so a workflow can
be created and pushed to the Worker.

```
cat > hello-world.yml  <<EOF
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
```

Create the template and push it to the database with the `tink template create` command.

```
$ docker exec -i deploy_tink-cli_1 tink template create --name hello-world < ./hello-world.yml

Created Template:  75ab8483-6f42-42a9-a80d-a9f6196130df
```

{{% notice note %}}
TIP: export the the template ID as a bash variable for future use:

$ export TEMPLATE_ID=75ab8483-6f42-42a9-a80d-a9f6196130df

{{% /notice %}}

## Create a workflow

The next step is to combine both the hardware data and the template to create a workflow.

- First, the workflow needs to know which template to execute. The Template ID you should use was returned by `tink template create` command executed above.
- Second, the Workflow needs a target, defined by the hardware data. In this example, the target is identified by the MAC address you got back from the `terraform apply` command

Combine these two pieces of information and create the workflow with the `tink workflow create` command.

```
$ docker exec -i deploy_tink-cli_1 tink workflow create \
    -t $TEMPLATE_ID \
    -r '{"device_1":'$(jq .network.interfaces[0].dhcp.mac hardware-data-0.json)'}'

Created Workflow:  a8984b09-566d-47ba-b6c5-fbe482d8ad7f
```

{{% notice note %}}
TIP: export the the workflow ID as a bash variable:

$ export WORKFLOW_ID=a8984b09-566d-47ba-b6c5-fbe482d8ad7f

{{% /notice %}}

The command returns a Workflow ID and if you are watching the logs, you will see:

```
tink-server_1  | {"level":"info","ts":1592936829.6773047,"caller":"grpc-server/workflow.go:63","msg":"done creating a new workflow","service":"github.com/tinkerbell/tink"}
```

## Check workflow status

You can not ssh into the worker but you can use the CLI from the provisioner to
validate if the workflow completed correctly using the `tink workflow events`
command (an event to show up can take ~5 minutes, check the SOS console for the
worker to see what it is doing):

```
$ docker exec -i deploy_tink-cli_1 tink workflow events $WORKFLOW_ID
>
+--------------------------------------+-------------+-------------+----------------+---------------------------------+--------------------+
| WORKER ID                            | TASK NAME   | ACTION NAME | EXECUTION TIME | MESSAGE                         |      ACTION STATUS |
+--------------------------------------+-------------+-------------+----------------+---------------------------------+--------------------+
| ce2e62ed-826f-4485-a39f-a82bb74338e2 | hello world | hello_world |              0 | Started execution               | ACTION_IN_PROGRESS |
| ce2e62ed-826f-4485-a39f-a82bb74338e2 | hello world | hello_world |              0 | Finished Execution Successfully |     ACTION_SUCCESS |
+--------------------------------------+-------------+-------------+----------------+---------------------------------+--------------------+
```

---

The `SOS` or `Out of bond` console provided by Packet is a very nice way to
follow what happens in the `worker` when the provisioner starts. My suggestion
is to ssh in the SOS console and watch it as well. The `SOS` or `Out of bond`
console provided by Packet is a very nice way to follow what happens in the
`worker` when the provisioner starts. My suggestion is to ssh in the SOS console
and watch it as well.

You can the command to ssh in:

```
ssh $(terraform output -json worker_sos | jq -r '.[0]')
```

## Cleanup

You can terminate worker and provisioner with the terraform destroy command:

```
$ terraform destroy
```

## FAQ

> Error: The facility sjc1 has no provisionable c3.small.x86 servers matching
> your criteria.

This error notifies you that the facility you are using (by default sjc1) does
not have devices available for `c3.small.x86`. You can change your device
setting a different `device_type` in `terraform.tfvars` (be sure that layer2 is
supported for the new device_type) or you can change facility with the variable
`facility` set to a different one.

In order to check availability of device type in a particular facility you can
use the packet-cli:

```
$ packet capacity get
```

You are looking for a facility that has a `normal` lavel of `c3.small.x84`.

> Error: timeout - last error: SSH authentication failed
> (root@136.144.56.237:22): ssh: handshake failed: ssh: unable to authenticate,
> attempted meth ods [none publickey], no supported methods remain

We use the Terraform
[file](https://www.terraform.io/docs/provisioners/file.html) function to copy
the `tink` directory from you local environment to the provisioner. Probably you
did not configured the `ssh-agent` properly. You should start the agent and add
the `private_key` that you use to ssh into the provisioner:

```
$ ssh-agent
$ ssh-add ~/.ssh/id_rsa
```

You don't need to run `terraform destroy`, this resources can be reapplied over
and over, you can attempt a fix and re-run `terraform apply`.

> Error: Upload failed: scp: /root//tink/deploy: Not a directory

This error happened to me when I did a few `terraform apply` one after each
other. The `/root/tink` directory in the provisioner was half way copied. I
removed it from the provisioner and I left terraform to copy it again.
