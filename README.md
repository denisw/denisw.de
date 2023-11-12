# denisw.de

The personal website of Denis Washington, built with [Eleventy](https://11ty.dev/).

https://www.denisw.de

## Deployment Setup

The website is hosted at [statichost.eu](https://statichost.eu).

### Build Configuration

The build is configured at [`statichost.yml`](./statichost.yml). See the [statichost.eu docs][statichost-build-config] for a description of the available options.

### Deploy Key

To pull from this repositoy, statichost.eu generates a SSH key whose public part I had to add to the GitHub repository as a [deploy key](https://docs.github.com/de/authentication/connecting-to-github-with-ssh/managing-deploy-keys). The key is called "statichost.eu". See the [statichost.eu docs][statichost-git].

### DNS Configuration

The following custom domains are configured:

- `www.denisw.de` (primary domain)
- `denisw.de` (redirects to primary domain)

As Domaisy does not support ALIAS domain record for apex (root) domains, I had to configure an A record to the statichost.eu main server instead. See the [statichost.eu docs][statichost-domains].

[statichost-build-config]: https://www.statichost.eu/docs/build-config/
[statichost-domains]: https://www.statichost.eu/docs/domains/
[statichost-git]: https://www.statichost.eu/docs/git/
[statichost-webhooks]: https://www.statichost.eu/docs/webhooks/
