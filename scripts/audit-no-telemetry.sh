#!/usr/bin/env bash
set -euo pipefail
FAIL=0
RUNTIME_PATHS=(src/cli src/server src/runtime src/core src/mcp src/integrations src/utils src/daemon src/rendering src/types package.json package-lock.json)
check_pattern() {
  local pattern="$1"
  echo "[audit] checking runtime paths for: $pattern"
  if rg -n "$pattern" "${RUNTIME_PATHS[@]}" --glob '!**/__tests__/**' --glob '!**/snapshot-tests/**'; then
    echo "[audit] FAIL: found $pattern"
    FAIL=1
  else
    echo "[audit] PASS: no runtime match"
  fi
}
check_pattern '@sentry/node'
check_pattern 'Sentry\.init'
check_pattern 'wrapMcpServerWithSentry'
check_pattern 'ingest\.sentry'
check_pattern 'sentry\.io'
check_pattern 'raw\.githubusercontent\.com/cameroncooke/xcodemake'
check_pattern 'api\.github\.com/repos'
check_pattern 'releases/latest'
check_pattern 'npm view'
check_pattern 'brew info'
check_pattern 'fetch\('
if [ "$FAIL" -ne 0 ]; then echo '[audit] failed'; exit 1; fi
echo '[audit] passed'
