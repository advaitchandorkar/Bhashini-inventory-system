#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:5000}"

curl -sS "${API_URL}/api/health" | grep -q '"status": "ok"'
echo "Health check OK"
