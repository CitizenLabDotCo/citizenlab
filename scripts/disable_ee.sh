#!/bin/bash

rm .env-back
cp .env-back.example .env-back
echo "Restored example .env-back"

rm .env-front
cp .env-front.example .env-front
echo "Restored example .env-front"
