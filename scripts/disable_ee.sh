#!/bin/bash

if test -f "../citizenlab/citizenlab.config.ee.json"; then
  rm ../citizenlab/citizenlab.config.ee.json
  echo "Removed citizenlab.config.ee.json link"
fi

rm -r ../citizenlab/back/engines/ee
echo "Removed back/engines/ee"

rm ../citizenlab/.env-back
cp ../citizenlab/.env-back.example ../citizenlab/.env-back
echo "Restored example .env-back"

rm ../citizenlab/.env-front
cp ../citizenlab/.env-front.example ../citizenlab/.env-front
echo "Restored example .env-front"
