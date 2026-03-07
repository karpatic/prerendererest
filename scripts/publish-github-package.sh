#!/usr/bin/env bash
set -euo pipefail

# Publishes a scoped mirror package to GitHub Packages npm registry.
# Source package: prerendererest
# Mirror package: @karpatic/prerendererest (by default)

REPO_OWNER="${GITHUB_OWNER:-karpatic}"
BASE_NAME="prerendererest"
SCOPED_NAME="@${REPO_OWNER}/${BASE_NAME}"
REGISTRY="https://npm.pkg.github.com"
TOKEN="${GITHUB_NPM_TOKEN:-${NODE_AUTH_TOKEN:-}}"

if [[ -z "$TOKEN" ]]; then
  echo "Error: set GITHUB_NPM_TOKEN (or NODE_AUTH_TOKEN) with write:packages scope."
  exit 1
fi

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

cp index.js README.md LICENSE package.json "$TMP_DIR"/

SCOPED_NAME="$SCOPED_NAME" REGISTRY="$REGISTRY" node - <<'NODE' "$TMP_DIR/package.json"
const fs = require('fs');
const path = process.argv[2];
const scopedName = process.env.SCOPED_NAME;
const registry = process.env.REGISTRY;
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
pkg.name = scopedName;
pkg.publishConfig = {
  ...(pkg.publishConfig || {}),
  registry,
};
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
NODE

cat > "$TMP_DIR/.npmrc" <<EOF
@${REPO_OWNER}:registry=${REGISTRY}
//npm.pkg.github.com/:_authToken=${TOKEN}
EOF

echo "Publishing ${SCOPED_NAME} to GitHub Packages..."
(
  cd "$TMP_DIR"
  npm publish --access public
)

echo "Published ${SCOPED_NAME}"
