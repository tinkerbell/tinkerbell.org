+++
title = "Documentation"
date = 2020-06-27T16:16:15+05:30
draft = false
weight = 01
toc = false
+++
​
## Tinkerbell Documentation
Everything you need to know about Tinkerbell and it's major compnent microservices.
​
## What is Tinkerbell?
Tinkerbell is an open-source, bare metal provisioning engine, built and maintained by the team of Packet.
​
Interested in contributing? Check out our [Contributors' Page](/contributors).
​
## What's Powering the Tinkerbell?
The Tinkerbell stack consists of five microservices, or components: Boots (a DHCP server), Hegel (a metadata service), OSIE (an in-memory operating system installation environment), Tink (a workflow engine, and PBnJ (a Power and Boot service).
​
The workflow engine is comprised of a server and a CLI, which communicate over gRPC. The CLI is used to create a workflow along with its building blocks, templates and targets.
​
## First Steps
​
New to Tinkerbell or bare metal provisions? This is a great place to start!
​
  - Getting started set up Tinkerbell [locally with vagrant](/setup/local-with-vagrant/) or on [Packet with Terraform](/setup/packet-with-terraform/)
  - Run [hello world](/examples/hello-world/) to see Tinkerbell in action.
​
## Get Help
  Need a little help getting started? We're here!
​
   - Check out the [FAQs](/faq) - When there are questions, we document the answers.
   - Join our Community Slack
   - Submit an issue on [Github](https://github.com/tinkerbell/)
