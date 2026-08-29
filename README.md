# denisw.de

The personal website of Denis Washington ([denisw.de](https://denisw.de/)).

## Tech Stack

- Static site generator: [Build Awesome (Eleventy)](https://11ty.dev/)
- Templating engine: [Nunjucks](https://mozilla.github.io/nunjucks/)

## Deployment Setup

The website is hosted on [bunny.net]. Its static files are stored in [Bunny
Storage][bunny-storage] and served by [Bunny CDN][bunny-cdn], with redirects
and response headers controlled through [edge rules].

To document the setup and make it reproducible, I created it using [OpenTofu]
(a community fork of [Terraform]). The OpenTofu configuration can be found in
the [`infrastructure/`](./infrastructure/) folder. For simplicity's sake, I am
using storing OpenTofu state in a local file that is checked into version
control; I have, however, used [state encryption][opentofu-encryption] in order
to not accidentally expose any secrets.

The built website is uploaded to Bunny Storage through its [S3-compatible
API][bunny-s3], using [rclone]. See [`scripts/deploy.sh`](./scripts/deploy.sh).

Deployment of the website (but not of the infrastructure) on every push to the
main branch is automated with GitHub Actions.

[bunny-cdn]: https://bunny.net/CDN/
[bunny-storage]: https://bunny.net/storage/
[OpenTofu]: https://opentofu.org/docs/language/state/encryption/
[Terraform]: https://developer.hashicorp.com/terraform
[bunny-s3]: https://bunny.net/docs/storage/s3
[bunny.net]: https://bunny.net/
[edge rules]: https://bunny.net/docs/cdn/edge-rules
[opentofu-encryption]: https://opentofu.org/docs/language/state/encryption/
[rclone]: https://rclone.org/
