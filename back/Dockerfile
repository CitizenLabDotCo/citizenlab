# The purpose of this build stage is to extract only the dependency files (gemfiles and
# gemspec files) from the project. This enables us to optimize Docker layer caching by
# installing all the dependencies before copying the remaining project files to the
# Docker image in the later stages.
FROM alpine:3.17.2 AS dependency_files
SHELL ["/bin/ash", "-o", "pipefail", "-c"]

WORKDIR /app

COPY back/Gemfile back/Gemfile.* back/.ruby-version ./
COPY back/engines ./engines

# `version.rb` files are also kept as they are required by gemspec files.
RUN find engines -type f -not -name "*.gemspec" -not -name "version.rb" -print0 | xargs -0 rm -rf \
   && find engines -type d -empty -delete

FROM ruby:3.3.4-slim
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update                                        \
   && apt-get install -qq -y --no-install-recommends      \
   build-essential                                        \
   curl                                                   \
   lsb-release                                            \
   # Required to install git dependencies in Gemfile and by bundle-audit
   git                                                    \
   libgeos-dev                                            \
   libgmp3-dev                                            \
   # Required by mimemagic on which depends axlsx (3.0.0.pre)
   shared-mime-info                                       \
   # Required by `pg` gem
   libpq-dev                                              \
   # Used to wait for Postgres to be up in CircleCI
   netcat-openbsd                                         \
   # Image processing
   imagemagick                                            \
   jpegoptim                                              \
   optipng                                                \
   pngquant                                               \
   # jemalloc
   libjemalloc2                                           \
   # tiktoken_ruby
   clang                                                  \
   gnupg                                                  \
   && apt-get clean                                       \
   && rm -rf /var/lib/apt/lists/*

# Install Postgres client:
# Import the PostgreSQL repository signing key, add the repository, and install the package.
RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --yes --dearmor -o /usr/share/keyrings/postgresql-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/postgresql-archive-keyring.gpg] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    # Make sure the version of `postgresql-client` matches the version used by the
    # `postgres` service in `docker-compose.yml`.
    && apt-get update && apt-get install -y postgresql-client-16

WORKDIR /cl2_back

COPY --from=dependency_files /app .

ARG BUNDLE_JOBS
RUN bundle config set --local clean 'true'      \
   && bundle config set --local deployment 'true' \
   && bundle install                              \
   # Removing the cached files manually as --no-cache does not seem to work
   # (or at least it's not doing what I expect from it).
   && rm -rf ./vendor/bundle/ruby/2.7.0/cache

COPY back/. .

EXPOSE 4000

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
