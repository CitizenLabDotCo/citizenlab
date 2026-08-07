#! /usr/bin/env bash

set -e

readonly REPO_TYPE=$( echo "${CIRCLE_REPOSITORY_URL}" | awk '{ match($0,/@github/) ? r="github" : r="bitbucket"; print r }' )
readonly PROJECT_SLUG="${REPO_TYPE}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}"

readonly SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
readonly TMP_DIR=${SCRIPT_DIR}/temp
readonly CONFIG_FILE=${SCRIPT_DIR}/monorepo.json
readonly CONCURRENCY=8

readonly TRIGGER_PARAM_NAME="trigger"

# Branch that feature branches are cut from.
readonly DEFAULT_BRANCH="${MONOREPO_DEFAULT_BRANCH:-master}"

readonly BUILDS_FILE=${TMP_DIR}/builds.json
readonly DATA_FILE=${TMP_DIR}/data.json

# Get the list of configured packages or default ones.
function read_config_packages {
  c=$(jq --raw-output '(.packages // {}) | length' "$1")
  if [[ "${c}" == "0" ]]; then
    root_dir=$(jq --raw-output '.root // "packages"' "$1")
    find "${root_dir}/" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | awk -v d="${root_dir}" '{print $1 " " d "/" $1 "/"}'
  else
    jq -r '.packages | to_entries | map(([.key] + .value) | join(" ")) | join ("\n")' "$1"
  fi
}

# Download workflows status from CircleCI API (as JSON files).
function get_workflows {
  seq 0 100 $((($1 - 1) * 100)) | \
  awk \
    -v api="https://circleci.com/api/v1.1/project/${PROJECT_SLUG}" \
    -v tree="/tree/${CIRCLE_BRANCH}" \
    -v token="${CIRCLE_USER_TOKEN}" \
    -v dir="${TMP_DIR}/data." \
    '{ print $1 " " token " " api tree "?shallow=true&limit=100&offset=" $1 " " dir sprintf("%04d", $1) ".json" }' |\
  xargs -n4 -P${CONCURRENCY} bash -c 'curl -u "$1:" -L -Ss -o $3 -w "\tGET: [%{response_code}] %{url_effective}\n" $2'
}

# Creates a map of workflows and commit SHAs for which build passed.
function map {
  # Group by (workflow, commit sha, job name) and select
  # those workflows for which each job group contains at least one passed job.
  jq '.? | 
    group_by(.workflows.workflow_name) |
      map({ 
        (.[0].workflows.workflow_name):
          group_by(.vcs_revision) |
            map({
              commit: .[0].vcs_revision,
              queued_at: .[0].queued_at,
              jobs: group_by(.workflows.job_name) | map({ success: any(.status == "success") })
            }) |
            map(select(.jobs | all(.success))) |
            sort_by(.queued_at) |
            reverse | 
            map(.commit)
      }) |
      add |
      select (. != null)'
}

# Get the nearest commit from which the current branch was created.
#
# Previously parsed `git show-branch --remote`, which silently ignores refs past
# its 26-ref limit and so scraped an unrelated SHA once the repo outgrew that,
# marking every package changed. merge-base has no such limit.
#
# Prints nothing when there is no branch point; callers treat an empty parent as
# "assume everything changed".
function get_parent_commit {
  # No branch point on trunk. Only reached when there is also no previous build
  # to diff from, where building everything is the safe answer.
  if [[ "${CIRCLE_BRANCH}" == "${DEFAULT_BRANCH}" || "${CIRCLE_BRANCH}" == "production" ]]; then
    echo "On ${CIRCLE_BRANCH}: no branch point to diff against." >&2
    return
  fi

  remote_name=$(git remote show | head -n1)
  base_branch="${remote_name}/${DEFAULT_BRANCH}"

  if ! git rev-parse --verify --quiet "${base_branch}^{commit}" > /dev/null; then
    echo "Could not resolve ${base_branch}. Is it fetched?" >&2
    return
  fi

  # Tolerate failure rather than letting `set -e` abort the trigger job.
  git merge-base "${base_branch}" HEAD || {
    echo "No merge base between ${base_branch} and HEAD. Shallow clone?" >&2
    return 0
  }
}

# GIT diff each package to calculate the number of changed files. 
function diff {
  parent_sha=$1
  builds_file=$2

  # BSD wc (macOS) pads with leading spaces, breaking the parsing downstream.
  count_changes() { git diff "$1"..HEAD --name-only -- ${2} | wc -l | tr -d '[:space:]'; }

  while read -r package paths; do
    last_build_sha=$(jq --raw-output --arg p "${package}" '.[$p][0]' "${builds_file}")
    if [[ "${last_build_sha}" != "null" && "x${last_build_sha}" != "x" ]]; then
      # diff changes since most recent successfull build for current workflow
      echo "$(count_changes "${last_build_sha}" "${paths}")" "${last_build_sha:0:9}" built "${package}"
    elif [[ "x${parent_sha}" != "x" ]]; then
      # diff changes since parent branch commit sha
      echo "$(count_changes "${parent_sha}" "${paths}")" "${parent_sha:0:9}" new "${package}"
    else
      # no builds and missing parent branch (detached?)
      echo 99999 - new "${package}"
    fi
  done
}

function print_status {
  echo -e "\nTrigger\tExists\tChanges\tParent\t\tPackage\n$(printf '=%0.s' {1..60})"
  echo "$1" | jq --raw-output '
    def colors:
    {
      "red": "\u001b[31m",
      "green": "\u001b[32m",
      "yellow": "\u001b[33m",
      "default": "\u001b[39m",
      "reset": "\u001b[0m",
    };
    def choose_color(a):
      if .changes == 99999 then colors.red 
      elif .changes > 0 then colors.yellow 
      elif .branch == "built" then colors.green
      else colors.default
    end;
    .[] | choose_color(.) + 
      (if .changes > 0 then "[x]" else "[ ]" end) + "\t" + 
      (if .branch == "built" then "[x]" else "[ ]" end) + "\t" + 
      (.changes | tostring) + "\t" + 
      .parent + "\t" +
      .package + colors.reset
    '
}

function create_request_body {
  echo "$1" | 
  jq --raw-output --arg branch "${CIRCLE_BRANCH}" --arg trigger "${TRIGGER_PARAM_NAME}" --argjson params "${CI_PARAMETERS:-null}" '. | 
    map(select(.changes > 0)) | 
    reduce .[] as $i (($params // {}) * { ($trigger): false }; .[$i.package] = true) | 
    { branch: $branch, parameters: . } | 
    @json'
}

function create_pipeline {
  url="https://circleci.com/api/v2/project/${PROJECT_SLUG}/pipeline"
  echo -e "Trigger:\n\tUrl: ${url}\n\tData: $1"

  if [[ "${CI}" != "true" ]]; then
    echo "Not a CI environment. Skip pipeline trigger."
    exit 0
  fi;

  status_code=$(curl -s -u "${CIRCLE_USER_TOKEN}:" -o response.json -w "%{http_code}" -X POST --header "Content-Type: application/json" --header "x-attribution-login: ${CIRCLE_USERNAME}" -d "$1" "${url}")

  if [ "${status_code}" -ge "200" ] && [ "${status_code}" -lt "300" ]; then
      echo "API call succeeded [${status_code}]. Response: "
      cat response.json
  else
      echo "API call failed [${status_code}]. Response: "
      cat response.json
      exit 1
  fi
}

function init {
  if [[ "x${CIRCLE_USER_TOKEN}" == "x" ]]; then
    echo "ENV variable CIRCLE_USER_TOKEN is empty. Please provide a user token."
    exit 1
  fi

  mkdir -p "${TMP_DIR}"
  if [[ ! -f ${CONFIG_FILE} ]]; then
    echo "No config file found at ${CONFIG_FILE}. Using defaults."
    echo "{}" > "${CONFIG_FILE}"
  fi
}

function get_builds {
  echo "Getting workflow status:"
  get_workflows "$(jq '.pages // 1' "${CONFIG_FILE}")"
  wait

  cat "${TMP_DIR}"/data.*.json | jq --slurp 'reduce inputs as $i (.; . += $i) | flatten' > "${DATA_FILE}"
  map < "${DATA_FILE}" > "${BUILDS_FILE}"
  echo "Created build-commit map ${BUILDS_FILE}"
}

function debug {
  echo -e "\n\nDEBUG INFORMATION"
  echo -e "\n\n=== Builds ==="
  cat "${BUILDS_FILE}"
}

function get_parent {
  parent_commit=$(get_parent_commit)
  if [[ "x${parent_commit}" == "x" ]]; then
    echo "Parent commit: <none> - packages with no previous build will be treated as changed." >&2
  else
    echo "Parent commit: ${parent_commit}" >&2
  fi
  echo ${parent_commit}
}

function main {
  init
  get_builds
  git_parent_commit=$( get_parent )

  statuses=$(\
    read_config_packages "${CONFIG_FILE}" | 
    diff "${git_parent_commit}" "${BUILDS_FILE}" |
    jq --raw-input --slurp \
      'split("\n") | map(select(. != "")) | map(split(" ")) | map({ package: .[3], parent: .[1], branch: .[2], changes: .[0] | tonumber })')

  print_status "${statuses}"
  changed_packages=$( echo "${statuses}" | jq '. | map(select(.changes > 0)) | length' )
  total_packages=$( echo "${statuses}" | jq '. | length' )

  echo "Number of packages changed: ${changed_packages} / ${total_packages}"

  if [[ "${changed_packages}" != "0" ]]; then
    create_pipeline "$( create_request_body "${statuses}" )"
  else
    echo "No changes in packages. Skip workflow trigger."
  fi

  if [[ "${MONOREPO_DEBUG}" == "true" ]]; then
    debug
  fi
}

main "${@}"