#!/usr/bin/env bash
set -euo pipefail

BUMP="${1:-patch}"

if [[ "$BUMP" != "patch" && "$BUMP" != "minor" && "$BUMP" != "major" ]]; then
  echo "Usage: ./scripts/release.sh [patch|minor|major]"
  exit 1
fi

echo "Running local checks..."
npm run test:unit
npm run check

echo "Bumping version: $BUMP"
npm version "$BUMP"

echo "Publishing to npm..."
npm publish --access public

echo "Publishing scoped mirror to GitHub Packages..."
npm run publish:github

echo "Pushing commits + tags..."
git push
git push --tags

echo "Done. Local-first release complete."
