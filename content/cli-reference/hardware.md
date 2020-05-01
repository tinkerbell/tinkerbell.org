+++
title = "Hardware"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 10
toc = true
+++

Hardware (worker) data operations.

### Synopsis

Hardware operations:
```shell
  all         Get all known hardware for facility
  id          Get hardware by id
  ingest      Trigger tinkerbell to ingest
  ip          Get hardware by any associated ip
  mac         Get hardware by any associated mac
  push        Push new hardware to tinkerbell
  watch       Register to watch an id for any changes
```

### Options

```
  -h, --help   help for hardware
```

### See Also
 - [tink target](/cli-reference/target/) - Target operations
 - [tink template](/cli-reference/template/) - Template operations
 - [tink workflow](/cli-reference/workflow/) - Workflow operations