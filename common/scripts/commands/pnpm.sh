#!/usr/bin/env bash

set -e

__executor() {
  pnpm --recursive "$@"
}
