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

# CSS/JS are served with a 30-day immutable cache (see nginx-vbs.lk.conf) so
# repeat visitors don't refetch them on every load. Since they're not
# content-hashed, that means a returning browser can keep serving a stale,
# pre-deploy copy indefinitely and skip revalidation entirely — breaking the
# page against newer HTML. Stamp every local <link>/<script> reference with
# the deploy's commit hash so the URL itself changes when content does; the
# working copy here is disposable (reset on the next deploy), only the
# rsynced copy in $WEB_ROOT matters.
VERSION=$(git rev-parse --short HEAD)
for f in *.html; do
  sed -i -E "s#(/styles/[a-zA-Z0-9_-]+\.css)#\1?v=$VERSION#g; s#(/scripts/[a-zA-Z0-9_-]+\.js)#\1?v=$VERSION#g" "$f"
done

rsync -a --delete \
  --exclude '.git' --exclude 'deploy' --exclude 'tmp' --exclude '.gitignore' \
  ./ "$WEB_ROOT/"

echo "==> Reloading nginx (picks up any new static files immediately, reload just clears caches)"
sudo nginx -t && sudo systemctl reload nginx

echo "==> Done."
