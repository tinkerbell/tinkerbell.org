+++
title = "Target"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 20
toc = true
+++

Target operations.

### Synopsis

Target operations:
```shell
  create      create a target
  delete      delete a target
  get         get a target
  list        list all targets
  update      update a target
```

### Options

```
  -h, --help   help for target
```

### Examples

 - The command below creates a workflow target and returns its UUID.
 ```shell
  $ tink target create '{"targets": {"machine1": {"mac_addr": "98:03:9b:4b:c5:34"}}}'
 ```
