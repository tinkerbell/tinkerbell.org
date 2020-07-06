+++
title = "Hardware"
date = 2020-07-01
draft = false
weight = 10
toc = true
+++

## Hardware Operations

```
  all         Get all hardware data stored in the database.
  delete      Delete hardware data by ID.
  id          Get hardware data by ID.
  ip          Get hardware data by an associated IP Address.
  mac         Get hardware data by an associated MAC Address.
  push        Push new hardware data to the database.
  watch       Watch hardware data for changes.
```

`tink hardware --help` - Displays the available commands and usage for `tink hardware`.

### `tink hardware all`

Returns all the hardware data stored on the Provisioner as JSON objects.

```
tink hardware all [--help] [--facility]
```

**Options**

- `-h`, `--help` - Displays usage for `all`.
- `-f`, `--facility` - string used to build grpc and http urls

**Examples**

```
tink hardware all
>
{"metadata":{"instance":{},"facility":{"facility_code":"onprem"}},"network":{"interfaces":[{"dhcp":{"mac":"08:00:27:00:00:01","arch":"x86_64","ip":{"address":"192.168.1.5","netmask":"255.255.255.248","gateway":"192.168.1.1"}},"netboot":{"allow_pxe":true,"allow_workflow":true}}]},"id":"0eba0bf8-3772-4b4a-ab9f-6ebe93b90a94"}
{"metadata":{"instance":{},"facility":{"plan_slug":"c2.medium.x86","facility_code":"ewr1"}},"network":{"interfaces":[{"dhcp":{"mac":"08:00:27:00:00:01","arch":"x86_64","ip":{"address":"192.168.1.5","netmask":"255.255.255.248","gateway":"192.168.1.1"}},"netboot":{"allow_pxe":true,"allow_workflow":true}}]},"id":"0eba0bf8-3772-4b4a-ab9f-6ebe93b90a25"}
```

### `tink hardware delete`

Deletes the specified hardware data.

```
tink hardware delete <ID> [--help] [--facility]
```

**Arguments**

- `ID` - The ID of the hardware data you want to delete from the database. Use multiple IDs to delete more than one hardware data at a time.

**Options**

- `-h`, `--help` - Displays usage for `delete`.
- `-f`, `--facility` - string used to build grpc and http urls

**Examples**

```
tink hardware delete 0eba0bf8-3772-4b4a-ab9f-6ebe93b90a25
>
2020/07/01 15:01:04 Hardware data with id 0eba0bf8-3772-4b4a-ab9f-6ebe93b90a25 deleted successfully
```

### `tink hardware id`

Returns hardware data for the specified ID or IDs as JSON objects.

```
tink hardware id <ID> [--help] [--facility]
```

**Arguments**

- `ID` - The ID of the hardware data you want to retrieve from the database. Use multiple IDs to retrieve more than one hardware data at a time.

**Options**

- `-h`, `--help` - Displays usage for `id`.
- `-f`, `--facility` - string used to build grpc and http urls

**Examples**

```
tink hardware id 0eba0bf8-3772-4b4a-ab9f-6ebe93b90a94
>
{"metadata":{"instance":{},"facility":{"facility_code":"onprem"}},"network":{"interfaces":[{"dhcp":{"mac":"08:00:27:00:00:01","arch":"x86_64","ip":{"address":"192.168.1.5","netmask":"255.255.255.248","gateway":"192.168.1.1"}},"netboot":{"allow_pxe":true,"allow_workflow":true}}]},"id":"0eba0bf8-3772-4b4a-ab9f-6ebe93b90a94"}
```

### `tink hardware ip`

Returns hardware data for the specified IP Address or IP Addresses as JSON objects.

```
tink hardware id <IP> [--help] [--facility]
```

**Arguments**

- `IP` - The IP address of the hardware data you want to retrieve from the database. Use multiple IP addresses to retrieve more than one hardware data at a time.

**Options**

- `-h`, `--help` - Displays usage for `ip`.
- `-f`, `--facility` - string used to build grpc and http urls

**Examples**

```
tink hardware ip 192.168.1.5
>
{"metadata":{"instance":{},"facility":{"facility_code":"onprem"}},"network":{"interfaces":[{"dhcp":{"mac":"08:00:27:00:00:01","arch":"x86_64","ip":{"address":"192.168.1.5","netmask":"255.255.255.248","gateway":"192.168.1.1"}},"netboot":{"allow_pxe":true,"allow_workflow":true}}]},"id":"0eba0bf8-3772-4b4a-ab9f-6ebe93b90a94"}
```

### `tink hardware mac`

Returns hardware data for the specified MAC Address or MAC Addresses as JSON objects.

```
tink hardware mac <MAC> [--help] [--facility]
```

**Arguments**

- `MAC` - The MAC address of the hardware data you want to retrieve from the database. Use multiple MAC addresses to retrieve more than one hardware data at a time.

**Options**

- `-h`, `--help` - Displays usage for `mac`.
- `-f`, `--facility` - string used to build grpc and http urls

**Examples**

```
tink hardware mac 08:00:27:00:00:01
>
{"metadata":{"instance":{},"facility":{"facility_code":"onprem"}},"network":{"interfaces":[{"dhcp":{"mac":"08:00:27:00:00:01","arch":"x86_64","ip":{"address":"192.168.1.5","netmask":"255.255.255.248","gateway":"192.168.1.1"}},"netboot":{"allow_pxe":true,"allow_workflow":true}}]},"id":"0eba0bf8-3772-4b4a-ab9f-6ebe93b90a94"
```

### `tink hardware push`

Pushes the JSON-formatted hardware data from the specified file into the database.

```
tink hardware push --file <JSON_FILE> [--help] [--facility]
```

Or

```
cat <JSON_FILE> | tink hardware push
```

Or

```
tink hardware push < ./<JSON_FILE>
```

**Arguments**

- `JSON_FILE` - The file where the hardware data is defined in JSON format.

**Options**

- `--file`, `< ./<JSON_FILE>`, `cat <JSON_FILE>` - Specify the file containing the hardware data JSON. Alternatively, you can open and read the file instead.
- `-h`, `--help` - Displays usage for `push`.
- `-f`, `--facility` - string used to build grpc and http urls

**Examples**

```
tink hardware push --file data.json
>
2020/07/01 20:11:24 Hardware data pushed successfully
```

```
cat data.json | tink hardware push
>
2020/07/01 20:14:18 Hardware data pushed successfully
```

```
tink hardware push < ./data.json
>
2020/07/01 20:11:24 Hardware data pushed successfully
```

### `tink hardware watch`

Watch the specified hardware data for changes.

```
tink hardware watch <ID or IDs> [--help] [--facility]
```

**Arguments**

- `ID` - The ID of the hardware data you want to monitor for changes. Use multiple IDs to watch more than one hardware data.

**Options**

- `-h`, `--help` - Displays usage for `mac`.
- `-f`, `--facility` - string used to build grpc and http urls

**Examples**

```
tink hardware watch 0eba0bf8-3772-4b4a-ab9f-6ebe93b90a94
>

```
