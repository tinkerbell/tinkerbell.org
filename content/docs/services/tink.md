+++
title = "Tink"
date = 2020-09-01
draft = false
weight = 04
toc = false
+++

Tink provides the user interface and the API gateway to expose all the features distributed across the various other Tinkerbell services. It lives in the GitHub repository: [tinkerbell/tink](https://github.com/tinkerbell/tink).

It exposes three binaries:

1. The `tink-server` is a long running daemon written in Go that exposes a gRPC API. As a user and operator this is your entry point. You can register new hardware, create templates and workflows, and much more.
2. The `tink-cli` is one of the way you can use to interact with the `tink-server`. It is a command line interface written in Go and [Cobra](https://github.com/spf13/cobra).
3. The `tink-worker` is a binary that runs in every worker machine. It is one of the first processes started by a Worker and it executes workflows.

## Getting Tink

Right now we do not yet have a release cycle in place that builds and release binaries. You can either compile them by yourself or you can use the Docker container that is already built.

The docker containers are the ones in use when you follow the setup tutorial and run [`docker-compose`](https://github.com/tinkerbell/tink/blob/master/deploy/docker-compose.yml#L4).

### Getting the Docker Images

We relay on Docker a lot for both code distribution but and workflow execution. Our CI/CD pipeline builds and pushes images to
[quay.io](https://quay.io/tinkerbell) a popular image repository similar to Docker Hub.

There is a repository for every tool:

- [tink-cli](https://quay.io/repository/tinkerbell/tink-cli?tab=tags)
- [tink-worker](https://quay.io/repository/tinkerbell/tink-worker?tab=tags)
- [tink-server](https://quay.io/repository/tinkerbell/tink?tab=tags)

The tags are composed as: `sha-<gitsha>`, where `gitsha` is the first 7 characters of a git commit. Only master commits are pushed to quay.io.

### Building the Binaries

Tinkerbell uses the standard Golang toolchain. You can clone the tink repository:

```sh
git clone git@github.com:tinkerbell/tink
```

All the binaries are inside `cmd/tink-*`. Based on what you need, you can run `go build`. For example if you would like to compile the CLI, run:

```sh
go build cmd/tink-cli/main.go
```

You can also use `go run` if you want to run code without having to compile a binary:

```sh
go run cmd/tink-server/main.go
```

## tink-cli

### Building and Running `tink-cli`

One use case of the binaries, is if you want to run the `tink-cli` binary on the Provisioner, outside the `tink-server` container. This simplifies the CLI command usage.

Prerequisites:

- A bit of familiarity with `go build`, and Go has to be installed.
- A Provisioner up and running Tinkerbell (works with the Vagrant setup, for example)

SSH into the Provisioner and Navigate to the directory where you have cloned the tink repository.

```sh
ssh
cd tink
```

Now let's compile the binary with:

```sh
go build -o tink cmd/tink-cli/main.go
```

All traffic between Tinkerbell services is encrypted via TLS, so before running any `tink` commands there are two environment variables that authenticate the CLI to the `tink-server`. The `tink-server` listens on 127.0.0.1 and exposes ports 42113 and 42114.

- `TINKERBELL_CERT_URL=http://127.0.0.1:42114/cert`
- `TINKERBELL_GRPC_AUTHORITY=127.0.0.1:42113`

NOTE: In a real environment every person that has access to the host and ports can authenticate and use `tink-server`.

You can export them as environment variables or you can run them in-line as part of the `tink` command.

```sh
export TINKERBELL_GRPC_AUTHORITY=127.0.0.1:42113
export TINKERBELL_CERT_URL=http://127.0.0.1:42114/cert
```

Now you can run `tink` commands without `docker-exec`.

```sh
$ tink hardware list
>
+----+-------------+------------+----------+
| ID | MAC ADDRESS | IP ADDRESS | HOSTNAME |
+----+-------------+------------+----------+
+----+-------------+------------+----------+
```

You can also test by making some hardware data.

```sh
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
tink hardware push < ./hardware-data.json
>
2020/08/31 10:20:20 Hardware data pushed successfully
```

## tink-worker

The `tink-worker` runs the configured actions for a worker. To do this, the
worker must connect to the Tink server and the image registry server.

Several configuration parameters are required for this to be successful.  These
parameters may be configured through environment variables, command line
arguments, or a with a tink-worker.yaml (or tink-worker.json) file. This
configuration file can be located in either the current working directory or
`/etc/tinkerbell/`, only the first matching file will be used.

### Tink Worker Options

All of the worker options below are required unless a default value is
indicated.  Additionally, `TINKERBELL_CERT_URL` must be configured in the
environment.

Each option can be configured in the configuration by using the full given
argument name as the configuration key. Options whose help text includes an
environment variable name (eg. `DOCKER_REGISTRY`) can be configured with the
named environment variable.

Settings are first read from the configuration file, then from the environment,
and finally from the command line arguments.

```sh
$ tink-worker --help
  -r, --docker-registry string     Sets the Docker registry (DOCKER_REGISTRY)
  -h, --help                       help for tink-worker
  -i, --id string                  Sets the worker id (ID)
      --max-file-size int          Maximum file size in bytes (MAX_FILE_SIZE) (default 10485760)
      --max-retry int              Maximum number of retries to attempt (MAX_RETRY) (default 3)
  -p, --registry-password string   Sets the registry-password (REGISTRY_PASSWORD)
  -u, --registry-username string   Sets the registry username (REGISTRY_USERNAME)
      --retry-interval duration    Retry interval in seconds (RETRY_INTERVAL) (default 3ns)
      --timeout duration           Max duration to wait for worker to complete (TIMEOUT) (default 1h0m0s)
```
