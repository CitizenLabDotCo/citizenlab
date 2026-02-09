#!/bin/bash

if [ $# -ne 1 ]; then
  echo "Usage: $0 <branch/tag>"
  exit 1
fi

version="$1"

# Temporary fix until https://github.com/lastpass/lastpass-cli/pull/729 is merged
repository="https://github.com/aukecb/lastpass-cli.git"
# repository="https://github.com/lastpass/lastpass-cli.git"

# Clone the LastPass CLI repository with a shallow clone
if ! git clone --depth 1 --branch "$version" "$repository" lastpass-cli; then
    echo "Error: Failed to clone the repository."
    exit 1
fi


if [ ! -f /etc/lsb-release ]; then
  echo "lsb-release missing, unlikely to be a Ubuntu system"
  exit 1
fi
. /etc/lsb-release
if [ "$DISTRIB_RELEASE" == "22.04" ]; then
# Install the dependencies
  apt-get update
  apt-get --no-install-recommends -yqq install \
    bash-completion                            \
    build-essential                            \
    cmake                                      \
    libcurl4                                   \
    libcurl4-openssl-dev                       \
    libssl-dev                                 \
    libxml2                                    \
    libxml2-dev                                \
    pkg-config                                 \
    ca-certificates                            \
    xclip
fi

if [ "$DISTRIB_RELEASE" != "22.04" ]; then
# Install the dependencies
  apt-get update
  apt-get --no-install-recommends -yqq install \
    bash-completion                            \
    build-essential                            \
    cmake                                      \
    libcurl4                                   \
    libcurl4-openssl-dev                       \
    libssl-dev                                 \
    libxml2                                    \
    libxml2-dev                                \
    libssl1.1                                  \
    pkg-config                                 \
    ca-certificates                            \
    xclip
fi

# Build and install the LastPass CLI
cd lastpass-cli
make
make install

# Clean up
cd ..
rm -rf lastpass-cli

# copy permissions from another file
