#!/bin/bash

rm ../citizenlab/.env-back
cp ../citizenlab/.env-back.example ../citizenlab/.env-back
echo "Restored example .env-back"

rm ../citizenlab/.env-front
cp ../citizenlab/.env-front.example ../citizenlab/.env-front
echo "Restored example .env-front"
