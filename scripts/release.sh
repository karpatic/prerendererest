#!/usr/bin/env bash
set -euo pipefail

BUMP="${1:-patch}"

if [[ "$BUMP" != "patch" && "$BUMP" != "minor" && "$BUMP" != "major" ]]; then
  echo "Usage: ./scripts/release.sh [patch|minor|major]"
  exit 1
fi

echo "Running unit tests..."
npm run test:unit

echo "Bumping version: $BUMP"
npm version "$BUMP"

echo "Pushing commits + tags..."
git push
git push --tags

echo "Done. Create/publish a GitHub Release for the new tag to trigger npm publish workflow."
