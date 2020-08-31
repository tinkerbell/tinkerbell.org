+++
title = "Tink"
hidden = true
date = 2020-07-06
draft = false
weight = 100
toc = false
+++

GitHub repository: [tinkerbell/tink](https://github.com/tinkerbell/tink).

## The Tinkerbell interface

Tink provides the user interface and it is designed as API gateway to expose all
the features distributed across the various other services.

It exposes three binaries:

1. The `tink-server` is a long running daemon written in Go that exposes a gRPC
   API. As a user and operator this is your entrypoint. You can register new
   hardware, create template, start workflows and much more.
2. The `tink-cli` is one of the way you can use to interact with the
   `tink-server`. It is a command line interface written in Go and
   [Cobra](https://github.com/spf13/cobra).
3. The `tink-worker` is a binary that runs in every worker machine. It is one
   the first processes started by a worker and it executes workflows.

## How to get those binaries

Right now we do not yet have a release cycle in place that builds and release
binaries. You have to compile them by yourself or you can use the Docker
container we build for you.

The docker container are the one in use when you follow the setup tutorial and
run the
[`docker-compose`](https://github.com/tinkerbell/tink/blob/master/deploy/docker-compose.yml#L4).

### Build your own

Luckily we use the standard Golang toolchain. You can clone the tink repository:

```
$ git clone git@github.com:tinkerbell/tink
```

All the binaries are inside `cmd/tink-*` based on what you need you can run `go
build`. For example if you would like to compile the CLI:

```
$ go build cmd/tink-cli/main.go
```

You can even use `go run` if you want to just run code without having to compile
a binary:

```
$ go run cmd/tink-server/main.go
```

### Docker images

We relay on Docker a lot for code distribution but also for workflow execution.
Our CI/CD pipeline build and push images to
[quay.io](https://quay.io/tinkerbell) a popular image repository similar to
Docker Hub.

As you can see we have a repository for every tool:

* [tink-cli](https://quay.io/repository/tinkerbell/tink-cli?tab=tags)
* [tink-worker](https://quay.io/repository/tinkerbell/tink-worker?tab=tags)
* [tink-server](https://quay.io/repository/tinkerbell/tink?tab=tags)

The tag are composed as: `sha-<gitsha>`, where `gitsha` is the first 7 chars of
a git commit. Only master commits are pushed to quay.io.

## Vagrant setup and local cli

Prerequisite: a bit of familiarity with `go build`, Go has to be installed.

I find myself way more comfortable where I can run a CLI locally. During this
exercise you will follow the [Vagrant Setup](/docs/setup/local-with-vagrant)
tutorial, when you get to the section "Creating the Worker’s Hardware Data",
don't do it and we will build and run the tink-cli locally.

Let's follow the [Vagrant Setup](/docs/setup/local-with-vagrant).

Now that you have a provisioner up and running you can clone the tink
repository:

```
$ git clone git@github.com:tinkerbell/tink.git
$ cd tink
```

You can run the cli directly via:

```
$ go run cmd/tink-cli/main.go
tinkerbell CLI

Usage:
  tink [command]

Available Commands:
  hardware    tink hardware client
  help        Help about any command
  template    tink template client
  workflow    tink workflow client

Flags:
  -f, --facility string   used to build grpc and http urls
  -h, --help              help for tink
  -v, --version           version for tink

Use "tink [command] --help" for more information about a command.
```

Now let's compile it with:

```
$ go build -o tink cmd/tink-cli/main.go
$ tink hardware list
Error: undefined TINKERBELL_CERT_URL
Usage:
  tink hardware list [flags]

Flags:
  -h, --help   help for list

Global Flags:
  -f, --facility string   used to build grpc and http urls

undefined TINKERBELL_CERT_UR
```

`undefined TINKERBELL_CERT_UR` notifies you about an authentication issue you
are facing with the `tink-server`. All the traffic between tinkerbell services is encrypted via TLS.
There are two environment variable that we have to use in order to authenticate
the CLI:

- `TINKERBELL_CERT_URL=http://127.0.0.1:42114/cert`
- `TINKERBELL_GRPC_AUTHORITY=127.0.0.1:42113`

We use `127.0.0.1` as entrypoint for the CLI because Vagrant is configured to
expose the `tink-server` ports locally via [port
forwarding](https://www.vagrantup.com/docs/networking/forwarded_ports).

NOTE: As you can image in a real environment every person that as access to those URL
can authenticate and use `tink-server`.

You can export those env var or you can run them inline as part of the tink
command:

```
$ export TINKERBELL_GRPC_AUTHORITY=127.0.0.1:42113
$ export TINKERBELL_CERT_URL=http://127.0.0.1:42114/cert
$ tink hardware list
+----+-------------+------------+----------+
| ID | MAC ADDRESS | IP ADDRESS | HOSTNAME |
+----+-------------+------------+----------+
+----+-------------+------------+----------+
```

And now we get back an empty list of hardware. Let's register our first one as
the Vagrant setup guide suggests:

```
$ cat > hardware-data.json <<EOF
{
  "id": "ce2e62ed-826f-4485-a39f-a82bb74338e2",
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
$ tink hardware push < ./hardware-data.json
2020/08/31 10:20:20 Hardware data pushed successfully
```

Now that the hardware is registered you can list it again and keep playing with
the Vagrant Setup and with the `tink-cli`.
