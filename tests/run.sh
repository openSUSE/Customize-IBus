#!/usr/bin/env bash
set -euo pipefail

root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
schema_dir=$(mktemp -d)
trap 'rm -f -- "$schema_dir/gschemas.compiled"; rmdir -- "$schema_dir"' EXIT

glib-compile-schemas --strict --targetdir="$schema_dir" \
    "$root/customize-ibus@hollowman.ml/schemas"
GSETTINGS_BACKEND=memory GSETTINGS_SCHEMA_DIR="$schema_dir" \
    gjs -m "$root/tests/restart-requests.js" "$root/customize-ibus@hollowman.ml"
