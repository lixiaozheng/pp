#!/usr/bin/env bash

set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_ROOT="/Users/bytedance/Documents/codes/sre-config"
TARGET_DIR="$TARGET_ROOT/pp"

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required but was not found in PATH." >&2
  exit 1
fi

if [ ! -d "$TARGET_ROOT" ]; then
  echo "Target root directory does not exist: $TARGET_ROOT" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

echo "Syncing project files"
echo "  from: $SOURCE_DIR"
echo "  to:   $TARGET_DIR"

rsync -av \
  --exclude='.git/' \
  --exclude='.next/' \
  --exclude='node_modules/' \
  --exclude='out/' \
  --exclude='coverage/' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  --exclude='.env' \
  --exclude='.env.*' \
  "$SOURCE_DIR"/ "$TARGET_DIR"/

echo "Sync complete."
