#!/usr/bin/env bash
# Runs on the host before the devcontainer starts (initializeCommand in devcontainer.json).
#
# Many Makefile targets run `docker compose down`, which deletes the compose
# network. The devcontainer service isn't part of the base compose file, so its
# stopped container is left behind, pinned to the old network ID. The next
# `docker compose up --no-recreate` (as run by VS Code) then fails with:
#   Error response from daemon: failed to set up container networking: network <id> not found
# Detect that state and remove the stale container so compose recreates it.
set -euo pipefail

cid=$(docker ps -aq --no-trunc --filter "name=^cl-devcontainer$" | head -n1)
[ -z "$cid" ] && exit 0

for net_id in $(docker inspect "$cid" --format '{{range .NetworkSettings.Networks}}{{.NetworkID}} {{end}}'); do
  if ! docker network inspect "$net_id" >/dev/null 2>&1; then
    echo "cl-devcontainer is pinned to deleted network ${net_id:0:12}; removing it so it gets recreated"
    docker rm -f "$cid" >/dev/null
    exit 0
  fi
done
