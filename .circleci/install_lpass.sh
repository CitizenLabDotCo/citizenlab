#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Usage: $0 <branch/tag>"
  exit 1
fi

version="$1"
repository="https://github.com/lastpass/lastpass-cli.git"

# Clone the LastPass CLI repository with a shallow clone
if ! git clone --depth 1 --branch "$version" "$repository" lastpass-cli; then
    echo "Error: Failed to clone the repository."
    exit 1
fi

# Install the dependencies
apt-get update
apt-get --no-install-recommends -yqq install \
  build-essential=12.8ubuntu1.1 \
  cmake=3.16.3-1ubuntu1.20.04.1 \
  libcurl4=7.68.0-1ubuntu2.19 \
  libcurl4-openssl-dev=7.68.0-1ubuntu2.19 \
  libssl-dev=1.1.1f-1ubuntu2.19 \
  libxml2=2.9.10+dfsg-5ubuntu0.20.04.6 \
  libxml2-dev=2.9.10+dfsg-5ubuntu0.20.04.6 \
  libssl1.1=1.1.1f-1ubuntu2.19 \
  pkg-config=0.29.1-0ubuntu4 \
  ca-certificates=20230311ubuntu0.20.04.1

# Build and install the LastPass CLI
cd lastpass-cli
make
make install

# Clean up
cd ..
rm -rf lastpass-cli

# copy permissions from another file
