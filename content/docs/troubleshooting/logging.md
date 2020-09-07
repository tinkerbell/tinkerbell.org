# Centralized logging framework of Tinkerbell

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


Logging is crucial for any product or feature to ensure debugging and bug-free implementation. Logs of these services can be obtained using `docker logs <service name>`. For tink-worker and action containers, the steps are same and many a times it would happend that service containers has exited once the execution is completed leaving the user with an overhead of first searching the dead container `docker ps -a` to check the logs of that container. Also, logs are segregated across the nodes. So, the user will have to jump across the nodes to check the logs of the respective container or microservice. With the advent of more feature on these services microservices `docker logs` will become laborious to use from the console.

Centralized logging implementation tries to solve this problem. This feature adds the support of
- Log aggregation of these microservices to a log server.
- Logs redirection to a file thus NO dependency on `docker logs`. If the user wants he can create a logging container and mount log directory.
- Log rotation is added for the file.
- Plug and Play. (Please check implementation details)

## Implementation details

Centralized logging only captures docker or microservices logs. It leverages the [`logging driver`](https://docs.docker.com/config/containers/logging/configure/) and `logging option` parameter of the docker cli. Currently, we are supporting `server_address` and `tag` log-opts but in next releases, we will support other log-opts as well.
Moreover, we will also like to understand the use case of the log-opts before adding them, specifically how it improvise the centralized logging as a feature.


For the docker container configuration we have used
- `log-driver`: `syslog`
- `server-address`: `tcp://<tinkerbell_ip>:514`
- `tag`: `container_name/{{.Name}}`

On the platform, we have leveraged `syslog` driver with `rsyslog` linux package. Before implementation, we did compared it with other services like `journald`, `fluentd`, [others](https://docs.docker.com/config/containers/logging/dual-logging/) and in the end `syslog` with `rsyslog` came out as a favourable choice. It is easy to understand and use, plus it is present in all the Linux distros which the Tinkerbell is using.

All the containers configured as above and running across the nodes will push log messages to the Tinkerbell IP on 514 ports on which rsyslog listens using syslog. rsyslog is also configured to capture log messages using the tag and redirect them to separate file in a folder.

As part of the implementation, we want the tink services should be aware of the logging configurations and should execute the action containers with the same configuration. In order to make it consistent across services, we defined the environment variables for each parameter of the configuration. This also facilitated to bring the feature of `Plug and Play` where the user can easily change the configuration and it will remain consistent across the services and nodes for Tinkerbell services. These parameters can be located inside `tink` repo at `generate-envrc.sh` under `logging details` subheading. User can update logging configuration by changing the values in this file and use the new `envrc`.


## TODO Add an example for Plug and Play
