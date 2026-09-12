#!/bin/sh
set -e

DATA_DIR="${SILNAV_DATA_DIR:-/data}"
RUN_USER="silnav"

if [ "$(id -u)" = "0" ]; then
  if ! mkdir -p "$DATA_DIR" 2>/dev/null; then
    echo "silnav: warning: cannot create $DATA_DIR" >&2
  elif ! chown -R "$RUN_USER:$RUN_USER" "$DATA_DIR" 2>/dev/null; then
    echo "silnav: warning: cannot chown $DATA_DIR, saving may fail" >&2
  fi
  exec su-exec "$RUN_USER:$RUN_USER" "$@"
fi

exec "$@"
