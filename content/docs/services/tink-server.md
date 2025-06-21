---
title: "Tink Server"
draft: false
geekdocDescription: "A gRPC server for interacting with Tink workers."
latestTinkerbellVersion: "https://github.com/tinkerbell/tinkerbell/tree/v0.18.3"
---

## Overview

Tink Server exposes workflow actions over a gRPC API for [Tink Worker] to retrieve and execute. When a [Tink Worker] completes an action, it reports the status to Tink Server.
Tink Server uses Kubernetes custom resources to store workflow state.
Tink Server retrieves tasks from and updates task status' on [`Workflow`][workflow] Kubernetes custom resources. Tinkerbell users submit the [`Workflow`][workflow]s to the cluster via the Kube API Server.

## Architecture

## Usage

## Other Resources

[tink worker]: /docs/services/tink-worker
[workflow]: {{< stringparam "latestTinkerbellVersion" >}}/api/v1alpha1/tinkerbell/workflow.go
