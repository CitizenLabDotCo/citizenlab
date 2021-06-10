#!/bin/bash

cp citizenlab.config.ee.json ../citizenlab/.
echo "Copied citizenlab.config.ee.json"

cp -r back/engines/ee ../citizenlab/back/engines/.
echo "Copied back/engines/ee"

cp .env-back ../citizenlab/.
echo "Copied .env-back"

cp .env-front ../citizenlab/.
echo "Copied .env-front"
