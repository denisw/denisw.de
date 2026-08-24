#!/usr/bin/env bash
set -euo pipefail

bunny_object_storage_zone=www-denisw-de
bunny_object_storage_zone_location=de

# Build the site
npm run build

# Configure rclone remote bunny.net object storage
rclone config create bunnycdn s3 --non-interactive \
    provider=Other \
    "endpoint=https://${bunny_object_storage_zone_location}-s3.storage.bunnycdn.com" \
    env_auth=true \
    >/dev/null

# Upload files to the site's object storage zone
rclone sync --progress ./_site/ "bunnycdn:${bunny_object_storage_zone}"
