#! /usr/bin/env bash

set -e

EE_BRANCH=master
BACK=false
FRONT=false

set_ee_branch () {
  status_code=$(curl -s -u ${GITHUB_USER}:${GITHUB_ACCESS_TOKEN} -o response.json -w "%{http_code}"  https://api.github.com/repos/citizenlabdotco/citizenlab-ee/branches/${CIRCLE_BRANCH})

  if [ "${status_code}" -ge "200" ] && [ "${status_code}" -lt "300" ]; then
      echo "Matching branch found in citizenlab-ee, triggering on ${CIRCLE_BRANCH}"
      export EE_BRANCH=${CIRCLE_BRANCH}
  else
      echo "No matching branch found in citizenlab-ee, triggering on ${EE_BRANCH}"
  fi
}

launch_ee_ci () {
	curl --request POST \
      -u $CIRCLECI_API_TOKEN: \
      --url https://circleci.com/api/v2/project/github/CitizenLabDotCo/citizenlab-ee/pipeline \
      --header 'content-type: application/json' \
      --header 'x-attribution-login: '"$CIRCLE_USERNAME" \
      --data '{"branch":"'"$EE_BRANCH"'","parameters":{"citizenlab_branch": "'"$CIRCLE_BRANCH"'", "citizenlab_sha": "'"$CIRCLE_SHA1"'", "back": '"$BACK"', "front": '"$FRONT"'}}'
}

main () {
	BACK=$1
	FRONT=$2

	set_ee_branch
	launch_ee_ci
}

main "${@}"
