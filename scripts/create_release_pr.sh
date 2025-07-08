#!/bin/bash
set -euo pipefail

# Check if there's an existing release PR
existing_pr=$(gh pr list --state open --search "(Release OR release) in:title" --json url,title --jq '.[0]')

if [ -n "$existing_pr" ]; then
    echo "Found existing release PR: $(echo "$existing_pr" | jq -r '.url')"
    exit 0
fi

# Create PR title
today=$(date +%Y-%m-%d)
release_count=$(gh pr list --state all --search "Release $today in:title" | grep "Release $today" |wc -l)
release_number=$((release_count + 1))
pr_title="Release $today ($release_number)"

# Create the PR
pr_url=$(gh pr create --base production --head master --title "$pr_title" --body "")

echo "Created release PR: $pr_url"
