#!/bin/bash

if test -f "../citizenlab/citizenlab.config.private.json"; then
  echo "citizenlab/citizenlab.config.private.json exist, skipping"
else
  ln citizenlab.config.private.json ../citizenlab/.
  echo "Linked citizenlab/citizenlab.config.private.json"
fi

cp -r back/engines/private ../citizenlab/back/engines/private
echo "Copied back/engines/private"
