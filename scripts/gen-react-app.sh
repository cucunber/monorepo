#!/usr/bin/env bash

LIB_NAME="$1"
DIR="apps"

log_print() {
  echo "[gen-react-app]: $1"
}

if [ -z "$LIB_NAME" ]; then
  log_print "Usage: $0 <app-name> [Nx options]"
  exit 1
fi

log_print "Generating react app '$LIB_NAME'"

npx nx g @nx/react:app "$DIR/$LIB_NAME" "$@"
