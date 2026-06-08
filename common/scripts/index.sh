#!/usr/bin/env bash

set -e

cd "$(dirname "$0")/../.." || exit 1

## Current directory
_AC_ROOT="$PWD"

_main() {
  local cmd="$1"

  ! command -v pnpm >/dev/null && throw "command 'pnpm' is missing"
  ! command -v git >/dev/null && throw "command 'git' is missing"
  test -z "$cmd" && throw "first argument 'command' is required"

  shift

  local args=("$@")

  local script="$_AC_ROOT/common/scripts/commands/$cmd.sh"
  if test -f "$script"; then
    # shellcheck disable=SC1090
    source "$script"
    __executor "${args[@]}"
  else
    throw "command not found at %s" "$script"
  fi
}

#######################################################
##                     Utilities                     ##
#######################################################

throw() {
  local format="$1"
  shift
  # shellcheck disable=SC2059
  printf "$format\n" "$@" >&2
  exit 1
}

warn() {
  _log "WRN" "$@"
}
info() {
  _log "INF" "$@"
}
_log() {
  local key="$1" format="$2"
  shift 2

  # shellcheck disable=SC2059
  printf "[%3s] $format\n" "$key" "$@"
}

#######################################################
##                       Main                        ##
#######################################################

_main "$@"
