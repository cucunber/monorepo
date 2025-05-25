#!/usr/bin/env bash

LIB_NAME="$1"
ORG="@org"

log_print() {
  echo "[remove-lib]: $1"
}

if [ -z "$LIB_NAME" ]; then
  log_print "Usage: $0 <library-name> [Nx options]"
  exit 1
fi

log_print "Remove package '$LIB_NAME'"


nx g @nx/workspace:remove "$ORG/$LIB_NAME" "$@"