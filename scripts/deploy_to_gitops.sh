#!/bin/bash
set -euo pipefail

# Deploys an image to the Scaleway cluster by writing its tag into the GitOps
# repo, where Argo CD picks it up and reconciles the cluster.
#
# Usage: deploy_to_gitops.sh <image-name> <image-tag>
#   image-name  the kustomize `images[].name` key, e.g. citizenlabdotco/back-ee
#   image-tag   what to deploy, e.g. amd64-<sha>
#
# Needs push access to the GitOps repo.

usage() {
    echo "usage: $(basename "$0") <image-name> <image-tag>" >&2
    exit 1
}

[ $# -eq 2 ] || usage
image=$1
tag=$2

GITOPS_REPO="CitizenLabDotCo/cl2-deployment"
KUSTOMIZATION_DIR="scaleway/gitops/apps/govocal"
# The branch where the tag is updated, which is the branch Argo CD tracks
# (targetRevision in scaleway/gitops/bootstrap/govocal.yaml). It needs to be
# switched to master once TAN-8322 is merged:
# https://github.com/CitizenLabDotCo/cl2-deployment/pull/1117
GITOPS_BRANCH="tan-8322/govocal-scaleway-core-deployment"

workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT

git clone --depth 1 --branch "$GITOPS_BRANCH" "git@github.com:${GITOPS_REPO}.git" "$workdir/repo"
cd "$workdir/repo/$KUSTOMIZATION_DIR"
kustomize edit set image "${image}=:${tag}"

cd "$workdir/repo"
if git diff --quiet; then
    echo "${image}:${tag} is already deployed; nothing to commit."
    exit 0
fi

# CI images carry no git identity, so fall back to one. Run locally, this keeps
# whoever is running it as the author.
git config user.name >/dev/null 2>&1 || git config user.name "CircleCI"
git config user.email >/dev/null 2>&1 || git config user.email "hello@citizenlab.co"
git commit -am "Deploy ${image}:${tag} [skip ci]"
git push origin "HEAD:${GITOPS_BRANCH}"

echo "Deployed ${image}:${tag} (${GITOPS_REPO}@$(git rev-parse --short HEAD) on ${GITOPS_BRANCH})"
