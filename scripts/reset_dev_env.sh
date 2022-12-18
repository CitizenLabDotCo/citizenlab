#!/usr/bin/env bash

# USAGE:
# cd citizenlab
# ./scripts/reset_dev_env.sh # master branch is used
# ./scripts/reset_dev_env.sh production # production branch is used

# WARNING:
# The script stashes (https://git-scm.com/docs/git-stash) source code changes
# and removes volumes with all the data.

set -o xtrace # print every executed line
set -Eeuo pipefail # print and exit on errors

BRANCH=${1:-master}

git fetch --all
git stash
git checkout "$BRANCH"
git pull || true # do not exit on error (maybe there's no remote branch)

cd front
npm i


cd ..
# -v removes volumes with all the data inside https://docs.docker.com/compose/reference/down/
docker-compose down -v || true # do not exit on error (some networks may be present, which is fine)
docker-compose build

# https://citizenlabco.slack.com/archives/C016C2EHURY/p1644234622002569
docker-compose run --rm web "bin/rails db:create && bin/rails db:reset"

docker-compose run --rm -e RAILS_ENV=test web bin/rails db:drop db:create db:schema:load
