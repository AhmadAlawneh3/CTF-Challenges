#!/bin/bash

cd "$(dirname "$0")" || exit

category=$(basename "$(dirname "$PWD")" | tr '[:upper:]' '[:lower:]')
chall_name=$(basename "$PWD" | tr '[:upper:]' '[:lower:]')
image_name="pwnregistry.azurecr.io/${category}-${chall_name}"

#build app
echo "Building $image_name for ${chall_name}"
docker build -t "$image_name" .