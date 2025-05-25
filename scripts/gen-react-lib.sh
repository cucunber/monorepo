#!/usr/bin/env bash

LIB_NAME="$1"
DIR="packages"

log_print() {
  echo "[gen-react-lib]: $1"
}

if [ -z "$LIB_NAME" ]; then
  log_print "Usage: $0 <library-name> [Nx options]"
  exit 1
fi

log_print "Generating react package '$LIB_NAME'"

npx nx g @nx/react:app "$DIR/$LIB_NAME" "$@"
