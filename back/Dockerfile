# The purpose of this build stage is to extract only the dependency files (gemfiles and
# gemspec files) from the project. This enables us to optimize Docker layer caching by
# installing all the dependencies before copying the remaining project files to the
# Docker image in the later stages.
FROM alpine:3.17.2 AS dependency_files
SHELL ["/bin/ash", "-o", "pipefail", "-c"]

WORKDIR /app

COPY back/Gemfile back/Gemfile.* ./
COPY back/engines ./engines

# `version.rb` files are also kept as they are required by gemspec files.
RUN find engines -type f -not -name "*.gemspec" -not -name "version.rb" -print0 | xargs -0 rm -rf \
   && find engines -type d -empty -delete

FROM ruby:2.7.6-slim
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update                                           \
   && apt-get install -qq -y --no-install-recommends           \
   build-essential                                        \
   curl                                                   \
   # Required to install git dependencies in Gemfile and by bundle-audit
   git                                                    \
   libgeos-dev                                            \
   libgmp3-dev                                            \
   # Required by mimemagic on which depends axlsx (3.0.0.pre)
   shared-mime-info                                       \
   # Required by `pg` gem
   libpq-dev                                              \
   # Used to wait for Postgres to be up in CircleCI
   netcat                                                 \
   # Image processing
   imagemagick                                            \
   jpegoptim                                              \
   optipng                                                \
   pngquant                                              \
   # tiktoken_ruby
   clang                                               \
   && curl -sL https://deb.nodesource.com/setup_18.x  | bash - \
   && apt-get -y --no-install-recommends install nodejs        \
   # Install MJML parser required by email engine.
   && npm install -g mjml@4.4.1                                \
   && apt-get clean                                            \
   && rm -rf /var/lib/apt/lists/*

WORKDIR /cl2_back

RUN gem install bundler:2.3.20

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
