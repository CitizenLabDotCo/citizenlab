#!/bin/bash
set -euo pipefail

# Check if there's an existing release PR
existing_pr_url=$(gh pr list --state open --base production --head master --json url --jq '.[0].url')

if [ -n "$existing_pr_url" ]; then
    echo "Found existing release PR: $existing_pr_url"
    exit 0
fi

# Create PR title
today=$(date +%Y-%m-%d)
# We have to count the number of releases using grep because the GitHub doesn't
# support searching for exact matches in titles. As a result, the search may return PRs
# with titles that contain similar dates.
release_count=$(
  gh pr list --state merged --base production --head master --search "$today in:title" --json title --jq '.[].title' |
  grep -c "$today" || true | # grep exits with 1 if no matches are found
  tr -d '[:space:]' # some shells used in the team seem to add whitespaces to the grep output
)
release_number=$((release_count + 1))
pr_title="Release $today ($release_number)"

# Create the PR
pr_url=$(gh pr create --base production --head master --title "$pr_title" --body "")

echo "Created release PR: $pr_url"
