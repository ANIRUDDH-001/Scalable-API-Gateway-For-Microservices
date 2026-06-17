#!/bin/bash
# Verify that direct access to services without x-internal-key returns 403.
# Run with all 3 services and gateway running.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✅ PASS${NC}: $1"; }
fail() { echo -e "${RED}❌ FAIL${NC}: $1"; exit 1; }

check_403() {
  local url=$1
  local label=$2
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" = "403" ]; then
    pass "$label — returns 403 without x-internal-key"
  else
    fail "$label — expected 403, got $status"
  fi
}

check_200() {
  local url=$1
  local key=$2
  local label=$3
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" -H "x-internal-key: $key" "$url")
  if [ "$status" = "200" ]; then
    pass "$label — returns 200 with correct x-internal-key"
  else
    fail "$label — expected 200 with key, got $status"
  fi
}

KEY=${INTERNAL_SERVICE_KEY:-"dev_internal_key_shared_across_all_services"}

echo "=== Internal Service Key Bypass Tests ==="

# Health endpoints bypass the check (should return 200 without key)
for port in 3001 3002 3003; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/health")
  if [ "$status" = "200" ]; then
    pass "Service :$port /health bypasses key check (200 without key)"
  else
    fail "Service :$port /health should return 200 without key, got $status"
  fi
done

# Non-health endpoints require the key
check_403 "http://localhost:3001/register" "auth-service POST /register"
check_403 "http://localhost:3002/accounts" "accounts-service GET /accounts"
check_403 "http://localhost:3003/transactions" "transactions-service GET /transactions"

# With correct key: should reach the route (200 or other business logic status)
check_200 "http://localhost:3002/accounts" "$KEY" "accounts-service with correct key"

echo ""
echo "=== All internal key tests passed ==="
