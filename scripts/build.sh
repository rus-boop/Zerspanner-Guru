#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${VERCEL:-}" == "1" ]]; then
  echo "Running native Next.js build for Vercel..."
  exec "${script_dir}/../node_modules/.bin/next" build
fi

exec bash "${script_dir}/build-verified.sh" "$@"
