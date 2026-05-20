#!/usr/bin/env bash
set -euo pipefail

echo "[no-telemetry] Applying hardening"
node <<'NODE'
const fs = require('fs');
const path = 'package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
if (pkg.dependencies && pkg.dependencies['@sentry/node']) {
  delete pkg.dependencies['@sentry/node'];
  fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
  console.log('[no-telemetry] Removed @sentry/node from package.json');
} else {
  console.log('[no-telemetry] @sentry/node already absent from package.json');
}
NODE
npm install --package-lock-only >/dev/null
echo "[no-telemetry] Done"
