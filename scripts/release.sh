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

echo "Pushing commit + tag..."
git push
git push --tags

echo "Done. Publish a GitHub Release for the new tag to trigger dual package publish."
