#!/usr/bin/env bash
# Publish the built front-end to one bucket. Run from front/ after `npm run build`.
#
#   deploy-front.sh <bucket> [aws global options...]
#
# The options are passed to every `aws` call, e.g. `--endpoint-url` for an
# S3-compatible provider; credentials come from the environment.
#
# 1. Only upload ~4k Twemoji if anything changes (content-hashed prefix).
# 2. Upload the build to assets/, shared by all releases. Use `cp`, not
#    `sync`: `cp` re-uploads every file, refreshing its date, so the bucket
#    lifecycle rule (expire 60 days after upload) only removes files no
#    recent release uses. `sync` also lists the whole folder first.
# 3. Upload index.html last: the switch to the new release.
set -euo pipefail

bucket=$1
shift
: "${TWEMOJI_BASE_URL:?not set}"

# Assigned outside the `if` so that a failed call (e.g. credentials without
# the s3:ListBucket permission) aborts the job instead of silently skipping
# the upload.
twemoji_key_count=$(aws "$@" s3api list-objects-v2 --bucket "$bucket" --prefix "${TWEMOJI_BASE_URL#/}" --max-keys 1 --query 'KeyCount' --output text)
if [ "$twemoji_key_count" = "0" ]; then
  aws "$@" s3 sync app/public/twemoji/ "s3://${bucket}${TWEMOJI_BASE_URL}" --acl public-read --cache-control "public, max-age=31536000, immutable"
fi

aws "$@" s3 cp build/assets/ "s3://${bucket}/assets/" --recursive --acl public-read --cache-control "public, max-age=31536000, immutable"
aws "$@" s3 cp build/index.html "s3://${bucket}/index.html" --acl public-read --cache-control no-cache
aws "$@" s3 cp .well-known/security.txt "s3://${bucket}/.well-known/security.txt" --acl public-read --content-type text/plain --cache-control "public, max-age=2592000"
