+++
title = "Template"
date = 2019-01-04T16:16:15+05:30
draft = false
weight = 30
toc = true
+++

Template operations.

### Synopsis

Template operations:
```shell
  create      create a workflow template
  delete      delete a template
  get         get a template
  list        list all saved templates
  update      update a template
```

### Options

```
  -h, --help   help for target
```

### Examples

 - The following command creates a workflow template using the `sample.tmpl` file and save it as `sample`.
   It returns a UUID for the newly created template.
 ```shell
  $ tink template create -n <template-name> -p <path-to-template>
  $ tink template create -n sample -p /tmp/sample.tmpl
 ```

 - List all the templates
 ```shell
  $ tink template list
 ```

 - Update the name of an existing template
 ```shell
  $ tink template update <template-uuid> -n <new-name>
  $ tink template update edb80a56-b1f2-4502-abf9-17326324192b -n new-sample-template
 ```

 - Update an existing template and keep the same name
 ```shell
  $ tink template update <template-uuid> -p <path-to-new-template-file>
  $ tink template update edb80a56-b1f2-4502-abf9-17326324192b -p /tmp/new-sample-template.tmpl
 ```

### See Also

 - [tink hardware](/cli-reference/hardware/) - Hardware (worker) data operations
 - [tink target](/cli-reference/target/) - Target operations
 - [tink workflow](/cli-reference/workflow/) - Workflow operations
