#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# A normal Node installation takes precedence. Codex Desktop bundles a runtime
# that also allows this checkout to run when Node is absent from the user's PATH.
if ! command -v node >/dev/null 2>&1; then
  runtime_root="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
  if [ -x "$runtime_root/node/bin/node" ]; then
    export PATH="$runtime_root/node/bin:$runtime_root/bin/fallback:$PATH"
  else
    echo 'Instala Node.js 22.12 o superior y pnpm 11.25.0 para continuar.' >&2
    exit 1
  fi
fi
if ! command -v pnpm >/dev/null 2>&1; then
  echo 'Instala pnpm con: npm install --global pnpm@11.25.0' >&2
  exit 1
fi
if [ ! -d node_modules ]; then
  pnpm install --frozen-lockfile
fi
exec pnpm start "$@"
