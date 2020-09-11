# Logging framework of Tinkerbell

## Overview

Tinkerbell as of today is a composition of following microservices

- tink-server
- hegel
- boots
- db
- cli
- nginx
- registry
- tink-worker
- action containers

Logging is crucial for any product or feature to ensure debugging and bug-free implementation. Logs of these services can be obtained using `docker logs <service name>`. For tink-worker and action containers, the steps are same and many times it would happen that service containers have exited once the execution is completed leaving the user with an overhead of first searching the dead container `docker ps -a` to check the logs of that container. Also, logs are segregated across the nodes. So, the user will have to jump across the nodes to check the logs of the respective container or microservice. With the advent of more feature on these services microservices `docker logs` will become laborious to use from the console.

Logging framework of Tinkerbell tries to solve these problems. This feature adds the support of

- Log aggregation of these microservices to a log server.
- Logs redirection to a file, thus NO dependency on `docker logs`. If the user wants they can create a logging container and mount log directory.
- Log rotation is added for the file.
- [Plug and Play](#plug-and-play). (Please check below)

## Implementation details

Centralized logging only captures docker or microservices logs. It leverages the [`logging driver`](https://docs.docker.com/config/containers/logging/configure/) and `logging option` parameter of the docker cli. `log driver` and`logging options (log-opt)` mechanism facilitates streaming and collection of docker logs as per the requirement.

For the docker container configuration, we have used below logging parameters

- `log-driver`: `syslog`
- `server-address`: `tcp://<log_server_address_ip>:514`
- `tag`: `container_name/{{.Name}}`

As part of the implementation, we desired to keep all tink services consistent with logging configurations and successively they should also execute the action containers with the same configuration. To achieve it, we defined the environment variables for each parameter of the configuration. These environment variables are pushed to the container of all the tink services from the host when they are started. This also facilitated to bring the feature of `Plug and Play` where the user can easily change the configuration and it will remain consistent across the services and nodes for Tinkerbell services. These parameters can be located inside `tink` repo at `generate-envrc.sh` under `logging details` subheading. User can update logging configuration by changing the values in this file and use the new `envrc`.

These parameters are pushed into Tinkerbell ecosystem via below environment variables from the host.

```
LOG_DRIVER                   # Defines the type of log driver like syslog or fluentd, journald etc
LOG_OPT_SERVER_ADDRESS_TYPE  # Defines the type of log server-address type like syslog-address or fluentd-address etc
LOG_OPT_SERVER_ADDRESS       # Defines the IP address of log server
LOG_OPT_TAG                  # Defines the tag which will be marked on the Tinkerbell containers
```

As of now, we are supporting `server_address` and `tag` log-opts but in next releases, we will support other log-opts as well. Moreover, we would also like to understand the use case of other log-opts before adding them, specifically how they can improve the centralized logging as a feature.

Once the host-level configuration are completed we can start the Tinkerbell docker services using docker-compose. In the respective docker-compose file these configurations are reflected via variables as shown below. Please note, `log-address-type` is a key in the docker-compose file. So, as of now, it is required to manually change the value as per the type of log-driver. (See [Default logging configuration](#defualt-logging-configuration) and [Plug & Play](#plug-and-play) for more reference.)

```
<some-tink-service>:
  .configuration
  .
  .
  logging:
    driver: ${LOG_OPT_DRIVER}
    options:
      <log-address-type>: ${LOG_OPT_SERVER_ADDRESS}
      tag: ${LOG_OPT_TAG}
```

## Default logging configuration

For the default configuration, we have leveraged `syslog` driver with `rsyslog` linux package. Log driver for the same is [`syslog`](https://docs.docker.com/config/containers/logging/syslog/). Before implementing, we compared it with other services like `journald`, `fluentd`, [others](https://docs.docker.com/config/containers/logging/dual-logging/) and in the end `syslog` with `rsyslog` came out as the favourable choice. It is easy to understand and use, plus it is present in all the Linux distros which Tinkerbell is using.

All the containers configured as below, and running across the nodes will push log messages to the Tinkerbell provisioner IP on the standard `syslog` port of 514\. `rsyslog` is configured to capture log messages using the tag and redirect them to separate file in a folder. The name of the folder will be the hostname of the node on which container would be running. Along with that, log rotation support is also added.

```
export LOG_DRIVER=syslog
export LOG_OPT_SERVER_ADDRESS_TYPE=syslog-address
export LOG_OPT_SERVER_ADDRESS=tcp://192.168.1.1:514
export LOG_OPT_TAG=Tinkerbell/{{.Name}}
```

Below are the configuration files for the `rsyslog` service and be located under `tink` repo.

- `rsyslog_docker_container.conf`
- `rsyslog_docker_daemon.conf`
- `rsyslog_log_rotate.conf`
- `rsyslog.conf`

- [rsyslog docker-compose file](docker_compose_rsyslog.yml) is used for managing Tinkerbell services.

## Plug and Play

As we mentioned, centralizing the logs by leveraging the docker services and environment variables paved the way to change the configuration. Below is a minimal example using `fluentd` on `Ubuntu bionic` which describes how you change the logging configuration.

- Bring down the current running service.

  `/vagrant/deploy> docker-compose down`

- Install `fluentd` agent on provisioner.

  `curl -L http://toolbelt.treasuredata.com/sh/install-ubuntu-xenial-td-agent2.sh -o install-td-agent.sh`

  `sh install-td-agent.sh`

- Create a fluentd configuration file.

  ```
   cat > test_fluentd.conf <<EOF
   <source>
     @type forward
     port 24224
     bind 0.0.0.0
   </source>

   <match Tinkerbell/*>
     @type stdout
   </match>
   EOF
  ```

- Make sure, the `match` string (here `Tinkerbell/*`) matches with the `LOG_TAG` environment variable (check line no.150).

- Start the fluent service with configuration file. `td-agent -c test_fluentd.conf`

  Please note, due to some issues in td-agent, above execution may fail stating `bind address already in use`. In that case, please kill all the `td-agent` process.

- Once successful, you should see below messages on `stdout`.

  ```
  vagrant@provisioner:~$ td-agent -c test-fluentd.conf
  2020-09-09 15:22:18 +0000 [info]: reading config file path="test.conf"
  2020-09-09 15:22:18 +0000 [info]: starting fluentd-0.12.40
  2020-09-09 15:22:18 +0000 [info]: gem 'fluent-mixin-plaintextformatter' version '0.2.6'
  2020-09-09 15:22:18 +0000 [info]: gem 'fluent-plugin-kafka' version '0.6.1'
  2020-09-09 15:22:18 +0000 [info]: gem 'fluent-plugin-mongo' version '0.8.1'
  2020-09-09 15:22:18 +0000 [info]: gem 'fluent-plugin-rewrite-tag-filter' version '1.5.6'
  2020-09-09 15:22:18 +0000 [info]: gem 'fluent-plugin-s3' version '0.8.5'
  2020-09-09 15:22:18 +0000 [info]: gem 'fluent-plugin-scribe' version '0.10.14'
  2020-09-09 15:22:18 +0000 [info]: gem 'fluent-plugin-td' version '0.10.29'
  2020-09-09 15:22:18 +0000 [info]: gem 'fluent-plugin-td-monitoring' version '0.2.3'
  2020-09-09 15:22:18 +0000 [info]: gem 'fluent-plugin-webhdfs' version '0.7.1'
  2020-09-09 15:22:18 +0000 [info]: gem 'fluentd' version '0.12.40'
  2020-09-09 15:22:18 +0000 [info]: adding match pattern="Tinkerbell/*" type="stdout"
  2020-09-09 15:22:18 +0000 [info]: adding source type="forward"
  2020-09-09 15:22:18 +0000 [info]: using configuration file: <ROOT>
  <source>
    @type forward
    port 24224
    bind 0.0.0.0
  </source>
  <match Tinkerbell/*>
    @type stdout
  </match>
  </ROOT>
  2020-09-09 15:22:18 +0000 [info]: listening fluent socket on 0.0.0.0:24224
  ```

- Update the environment variables as below.

  ```
  export LOG_DRIVER=fluentd
  export LOG_OPT_SERVER_ADDRESS_TYPE=fluentd-address
  export LOG_OPT_SERVER_ADDRESS=192.168.1.1:24224
  export LOG_OPT_TAG=Tinkerbell/{{.Name}}
  ```

- Now from another tab, start the Tinkerbell services using [fluentd docker-compose file](docker_compose_fluentd.yml) with command `docker-compose -f docker_compose_fluentd.yml up -d`

- Once the services are up, check the `stdout` messages on `stdout` of `td-agent -f test_fluentd.conf`. These will be the log messages of the respective container.

- To test with action containers make sure you start a new worker as the existing worker will have the old configuration. Further, log messages of `tink-worker` and action docker container will also be visible under the same `stdout`.

- This example should how the logs are aggregating on fluentd service running on provisioner. This example can be extended by adding parsing configuration and additional containers like `kibana` or `elastic search` which can be used along with `fluentd`.
