#!/usr/bin/env bash
# Run on the vbs.lk OCI instance to deploy the latest main branch.
# Pure static site — no build step, just sync files into the web root.
# Usage: sudo -u vbsweb ./deploy.sh
set -euo pipefail

REPO_DIR="/opt/vbs-lk/src"
WEB_ROOT="/var/www/vbs.lk"

cd "$REPO_DIR"
git fetch origin
git checkout main
git reset --hard origin/main

rsync -a --delete \
  --exclude '.git' --exclude 'deploy' --exclude 'tmp' --exclude '.gitignore' \
  ./ "$WEB_ROOT/"

echo "==> Reloading nginx (picks up any new static files immediately, reload just clears caches)"
sudo nginx -t && sudo systemctl reload nginx

echo "==> Done."
