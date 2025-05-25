#!/usr/bin/env bash

LIB_NAME="$1"
DIR="packages"

log_print() {
  echo "[gen-lib]: $1"
}

if [ -z "$LIB_NAME" ]; then
  log_print "Usage: $0 <library-name> [Nx options]"
  exit 1
fi

log_print "Generating package '$LIB_NAME'"

npx nx g @nx/js:lib "$DIR/$LIB_NAME" --preset=ts "$@"
