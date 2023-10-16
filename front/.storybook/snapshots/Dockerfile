# TODO explain where this container is stored for the CI
FROM node:16.15.0-bullseye
LABEL maintainer="Luuc van der Zee" version="0.1.0"

# Install git lfs
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash && \
    apt-get update && \
    apt-get install git-lfs && \
    git lfs install

# Install playwright
RUN npx playwright install --with-deps
