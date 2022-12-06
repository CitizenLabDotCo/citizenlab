#!/bin/bash

cp citizenlab.config.ee.json ../citizenlab/.
echo "Copied citizenlab.config.ee.json"

cp -r back/engines/ee ../citizenlab/back/engines/.
echo "Copied back/engines/ee"

if [ ! -f ".env-back-secret" ]
then
  echo "ERROR: Generating .env-back failed because citizenlab-ee/.env-back-secret is missing. Get its content from LastPass ('citizenlab .env-back-secret' note) and retry."
  exit 1
fi
cat .env-back-safe .env-back-secret | tee ../citizenlab/.env-back > /dev/null
echo "Copied .env-back"


if [ ! -f ".env-front-secret" ]
then
  echo "ERROR: Generating .env-front failed because citizenlab-ee/.env-front-secret is missing. Get its content from LastPass ('citizenlab .env-front-secret' note) and retry."
  exit 1
fi
cat .env-front-safe .env-front-secret | tee ../citizenlab/.env-front > /dev/null
echo "Copied .env-front"
