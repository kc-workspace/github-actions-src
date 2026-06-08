#!/usr/bin/env bash

set -e

## The directory contains github actions compiled code
_AC_INPUT="${AC_INPUT:-lib-bundle}"
## The directory for deploy to github-actions repository
_AC_OUTPUT="${AC_OUTPUT:-common/temp/actions}"
## The directory where addition resources locate
_AC_RESOURCE="${AC_RESOURCE:-common/resources}"
## Auto run build when deploy to ensure fresh packages
_AC_AUTOBUILD="${AC_AUTOBUILD:-true}"
_AC_AUTOCLEAN="${AC_AUTOCLEAN:-false}"
## Force deploy to GitHub
_AC_FORCE="${AC_FORCE:-false}"
## The deployment commit settings
_AC_COMMIT_NAME="${AC_COMMIT_NAME:-github-actions[bot]}"
_AC_COMMIT_EMAIL="${AC_COMMIT_EMAIL:-41898282+github-actions[bot]@users.noreply.github.com}"
_AC_COMMIT_MSG="${AC_COMMIT_MSG:-perf(core): automatically updates (bot)}"
_AC_COMMIT_BRANCH="${AC_COMMIT_BRANCH:-main}"

__executor() {
  local action actions="${_AC_ROOT:?}/actions"
  local output="${_AC_ROOT:?}/${_AC_OUTPUT:?}"

  $_AC_AUTOBUILD && pnpm --recursive run build

  if $_AC_AUTOCLEAN; then
    info "Cleaning previous data"
    rm -r "${output:?}"/*
  fi

  info "Processing 'addition resources'"
  test -d "$output" || mkdir -p "$(dirname "$output")"
  cp -r "$_AC_ROOT/$_AC_RESOURCE/." "$output"

  ## Copy build output to deployment output
  local name dist
  for action in "$actions"/*; do
    name="$(basename "$action")"
    dist="$action/$_AC_INPUT"
    if test -d "$dist"; then
      info "Processing '%s' action" "$name"
      test -d "$output/$name" && rm -r "${output:?}/$name"
      cp -r "$dist" "$output/$name"
    else
      warn "Action '%s' didn't contains output directory" "$name"
    fi
  done

  if test -n "$CI" && test -n "$GITHUB_ACTIONS" || "$_AC_FORCE"; then
    cd "$output"

    info "Starting deploy '%s' package" "$PWD"
    git status

    if ! test -z "$(git status --porcelain)" || "$_AC_FORCE"; then
      git config --local user.name "$_AC_COMMIT_NAME"
      git config --local user.email "$_AC_COMMIT_EMAIL"

      git add --all
      git commit -m "$_AC_COMMIT_MSG"
      git push origin "$_AC_COMMIT_BRANCH"
    fi
  else
    warn "Skipped deploy to GitHub on local machine"
  fi
}
