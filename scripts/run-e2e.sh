#!/usr/bin/env bash
# Wrapper for e2e scripts — ensures .env.test.local exists before running.
set -euo pipefail

if [ ! -f .env.test.local ]; then
  echo "Error: .env.test.local not found."
  echo "Run 'npm run db:start' to start the local database and generate test credentials."
  exit 1
fi

exec dotenv -e .env.test.local -- "$@"
