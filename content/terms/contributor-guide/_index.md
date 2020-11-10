+++
title = "Contributing Guide for the Tinkerbell"
+++

Welcome to Tinkerbell! We're building the industry standard for bare metal infrastructure automation. And we'd love to have you join us. This guide will help you get started as a Tinkerbell contributor.

## Tinkerbell Projects

Tinkerbell is a bare metal provisioning engine and consists of five components: a DHCP server (Boots), a metadata service (Hegel), an in-memory operating system installation environment (OSIE), a workflow engine (Tink), and a Power and Boot service (PBnJ) that communicates with BMCs. Learn more about these and other repos we host:

|                          Project Name                          |                                  Description                                  |
| :------------------------------------------------------------: | :---------------------------------------------------------------------------: |
|          [boots](https://github.com/tinkerbell/boots)          |                      DHCP and iPXE server for Tinkerbell                      |
|          [hegel](https://github.com/tinkerbell/hegel)          |                   gRPC/http metadata service for Tinkerbell                   |
|           [tink](https://github.com/tinkerbell/osie)           |               In-memory installation environment for bare metal               |
|           [pbnj](https://github.com/tinkerbell/pbnj)           | Microservice that communicates with our bmcs, ipmi to control power, boot etc |
| [tinkerbell.org](https://github.com/tinkerbell/tinkerbell.org) |                 The code behind our website, docs and guides                  |

## How To Get Involved

We are grateful for our contributors and want this to be as easy and open as possible. We have a #tinkerbell [Slack channel](https://slack.equinixmetal.com) in the Equinix Metal community and it's the best place to keep up-to-date with all of the Tinkerbell projects.

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- We develop with GitHub
- Test out new features
- Contributes to docs
- Give talks at meetups, conferences, webinars about Tinkerbell

## Contribute to our Projects

Pull requests are the best way to propose changes to the codebase. We use GitHub flow and everything happens through pull requests. We welcome your pull requests; to make it simple, here are the steps to contribute:

- Fork the repo you're updating and create your branch from master.
- If you've added code that should be tested, add tests.
- If you've changed APIs, update the documentation.
- Ensure the test suite passes.
- Issue that pull request!

Any contributions you make will be under the MIT Software License
In short, when you submit code changes, your submissions are understood to be under the same MIT License that covers the project. Feel free to contact the maintainers if that's a concern.

### Write Thorough Commit Messages

Help reviewers know what you're contributing by writing good commit messages. To standardize how things are done, your first line of your commit is your _subject_, followed by a blank line, then a message describing what the commit does. We use the following guidelines suggested [by Chris Beams](https://chris.beams.io/posts/git-commit/) and our friends at [OpenFaas](https://www.openfaas.com/):

#### Commit messages

The first line of the commit message is the _subject_, this should be followed by a blank line and then a message describing the intent and purpose of the commit. These guidelines are based upon a [post by Chris Beams](https://chris.beams.io/posts/git-commit/).

When you commit, you are accepting our DCO:

> Developer Certificate of Origin
> Version 1.1
>
> Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
> 1 Letterman Drive
> Suite D4700
> San Francisco, CA, 94129
>
> Everyone is permitted to copy and distribute verbatim copies of this
> license document, but changing it is not allowed.
>
> Developer's Certificate of Origin 1.1
>
> By making a contribution to this project, I certify that:
>
> (a) The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file; or
>
> (b) The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless I am permitted to submit under a different license), as indicated in the file; or
>
> (c) The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it.
>
> (d) I understand and agree that this project and the contribution are public and that a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.

- When you run `git commit` make sure you sign-off the commit by typing `git commit --signoff` or `git commit -s`
- The commit subject-line should start with an uppercase letter
- The commit subject-line should not exceed 72 characters in length
- The commit subject-line should not end with punctuation (., etc)

Note: please do not use the GitHub suggestions feature, since it will not allow your commits to be signed-off.

When giving a commit body, be sure to:

- Leave a blank line after the subject-line
- Make sure all lines are wrapped to 72 characters

Here's an example that would be accepted:

```
Add peterpan to the contributors' _index.md file

We need to add peterpan to the contributors' _index.md file as a contributor.

Signed-off-by: Wendy <wendy@tinkerbell.org>
```

Some invalid examples:

```
(feat) Add page about X to documentation
```

> This example does not follow the convention by adding a custom scheme of `(feat)`

```
Update the documentation for page X so including fixing A, B, C and D and F.
```

> This example will be truncated in the GitHub UI and via `git log --oneline`

If you would like to ammend your commit follow this guide: [Git: Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)

## Report bugs using GitHub's issues

All bugs are tracked using Github issues. If you find something that needs to be addressed, open a new issue; it's easy!

When you open a new issue, please use the ticket template and provide as much detail, background, and sample code as you can.

### The Tinkerbell GitHub Issue Template

![](https://i.imgur.com/tUzEipZ.png)

## Propose an Idea

Have an idea to propose or something you'd like us all to discuss? Great, we have a [Request for Discussion](https://github.com/tinkerbell/proposals). When you submit your RFD, please tell us what needs to be added, what problem it will solve, and how you see it working. This helps build the official Tinkerbell roadmap, something that we believe should be done in the open, in a public forum, with input from the community, all contributors, and maintainers. If you have an idea for something that should be built for Tinkerbell, please include it in an RFD before building it.

## License

By contributing, you agree that your contributions will be licensed under its Apache License, adhere to the Developer Certificate of Origin, and adhere to our code of condense.
