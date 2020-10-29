![](https://img.shields.io/badge/Stability-Experimental-red.svg)

# Tinkerbell

For complete documentation visit [tinkerbell.org](https://tinkerbell.org/)

Tinkerbell is a bare metal provisioning engine.
It’s built and maintained with love by the team at Equinix Metal.

This repository is [Experimental](https://github.com/packethost/standards/blob/master/experimental-statement.md) meaning that it's based on untested ideas or techniques and not yet established or finalized or involves a radically new and innovative style!
This means that support is best effort (at best!) and we strongly encourage you to NOT use this in production.

## Contributing

This website uses Hugo to generate static HTML pages.
It's hosted and automatically build by Netlify (see [netlify.toml](./netlify.toml "View file") for more details).

- [`content/`](./content/ "View the directory") directory contains documentation files
- [`config.toml`](./config.toml "View file") is the Hugo configuration
- [`netlify.toml`](./netlify.toml "View file") is Netlify configuration

### Build the site locally

Make sure you have installed [Hugo](https://gohugo.io/getting-started/installing/) on your system.
Follow the instructions to clone this repository and build the docs locally.

- Clone the repository

```sh
git clone https://github.com/tinkerbell/tinkerbell.org
cd tinkerbell.org
```

- Fetch the theme submodule

```sh
git submodule update --init --recursive
```

- Start local server

```sh
hugo server -D
```

Site can be viewed at [http://localhost:1313](http://localhost:1313)

### Generate custom css files

- Run npm insall

```sh
npm install
```

- Development

```sh
npm run watch
```

- Production

```sh
npm run production
```

### Making changes

#### Adding a new documentation page

```sh
# example: adding new documentation page under section
hugo new section/name-of-new-page.md
```

#### Modifying an existing documentation page

Find the documentation page file (`.md` file) under `content/` and edit it.

### Publishing your changes

[Create a Pull Request](https://help.github.com/en/articles/creating-a-pull-request) with your changes.
When the PR is merged site will be updated automatically by Netlify.

## Licensing

The code snippets and the documentation is licensed under Apache license.
See [LICENSE](./LICENSE) for the full license text.
