#!/bin/bash

if test -f "../citizenlab/citizenlab.config.ee.json"; then
  echo "citizenlab/citizenlab.config.ee.json exist, skipping"
else
  ln citizenlab.config.ee.json ../citizenlab/.
  echo "Linked citizenlab/citizenlab.config.ee.json"
fi

cp -r back/engines/ee ../citizenlab/back/engines/ee
echo "Copied back/engines/ee"
