#!/usr/bin/env bash

LIB_NAME="$1"

log_print() {
  echo "[build-lib]: $1"
}

if [ -z "$LIB_NAME" ]; then
  log_print "Usage: $0 <library-name> [Nx options]"
  exit 1
fi

log_print "Building package '$LIB_NAME'"


nx build "$LIB_NAME" "$@"