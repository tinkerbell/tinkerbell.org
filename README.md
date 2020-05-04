# Tinkerbell

For complete documentation visit [tinkerbell.org](https://tinkerbell.org/)

<<<<<<< HEAD
Tinkerbell is a bare metal provisioning engine.
It’s built and maintained with love by the team at Packet.

## Contributing

This website uses Hugo to generate static HTML pages.
It's hosted and automatically build by Netlify (see [netlify.toml](./netlify.toml 'View file') for more details).

- [`content/`](./content/ 'View the directory') directory contains
  documentation files
- [`config.toml`](./config.toml 'View file') is the Hugo configuration
- [`netlify.toml`](./netlify.toml 'View file') is Netlify
  configuration

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

### Running Gatsby version

1. Install npm https://www.npmjs.com/get-npm
2. Install gatsby-cli https://www.gatsbyjs.org/docs/quick-start/#install-the-gatsby-cli
3. Install the dependencies `npm install`
4. Run `gatsby develop` for Gatsby development server
5. Run `gatsby build` or `npm run build` for build
6. For netlify deployment, please use `npm run build` for build command as mentioned in https://www.gatsbyjs.org/docs/deploying-to-netlify/

## Licensing

The code snippets and the documentation is licensed under Apache license.
See [LICENSE](./LICENSE) for the full license text.
