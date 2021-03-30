#!/bin/bash

if test -f "../citizenlab/citizenlab.config.ee.json"; then
  echo "citizenlab/citizenlab.config.ee.json exist, skipping"
else
  ln citizenlab.config.ee.json ../citizenlab/.
  echo "Linked citizenlab/citizenlab.config.ee.json"
fi

cp -r back/engines/ee ../citizenlab/back/engines/.
echo "Copied back/engines/ee"

cp .env-back ../citizenlab/.
echo "Copied .env-back"

cp .env-front ../citizenlab/.
echo "Copied .env-front"
