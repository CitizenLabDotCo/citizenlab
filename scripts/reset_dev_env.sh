#!/usr/bin/env bash

# USAGE:
# cd citizenlab-ee
# ./scripts/reset_dev_env.sh # master branch is used for both repos
# ./scripts/reset_dev_env.sh production # production branch is used for both repos
# ./scripts/reset_dev_env.sh production cad1749 # production branch is used for the OS repo. The commit cad1749 is used for EE.
#
# NOTE:
# If the very basic functions like login don't work, most likely OS and EE versions are incompatible.
# Please try to run `./scripts/reset_dev_env.sh` to use master branch or `./scripts/reset_dev_env.sh production`.
#
# WARNING:
# The script stashes (https://git-scm.com/docs/git-stash) source code changes
# and removes volumes with all the data.

set -o xtrace # print every executed line
set -Eeuo pipefail # print and exit on errors

BRANCH=${1:-master}
EE_BRANCH=${2:-$BRANCH}

git fetch --all
git stash
git checkout "$EE_BRANCH"
git pull || true # do not exit on error (maybe there's no remote branch)

sh scripts/disable_ee.sh # remove multi_tenancy code
sh scripts/enable_ee.sh


cd ../citizenlab
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
docker-compose run --rm web bash -c "bin/rails db:create && bin/rails db:reset"

docker-compose run --rm -e RAILS_ENV=test web bin/rails db:drop db:create db:schema:load
