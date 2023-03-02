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

ARG CITIZENLAB_EE=false
ENV CITIZENLAB_EE=$CITIZENLAB_EE

RUN apt-get update                                                             \
 && apt-get install -qq -y --no-install-recommends                             \
      build-essential=12.9                                                     \
      curl=7.74.0-1.3+deb11u7                                                  \
      libgeos-dev=3.9.0-1                                                      \
      libgmp3-dev=2:6.2.1+dfsg-1+deb11u1                                       \
      libpq-dev=13.9-0+deb11u1                                                 \
      git=1:2.30.2-1+deb11u2                                                   \
      netcat=1.10-46                                                           \
      shared-mime-info=2.0-1                                                   \
      # Image processing
      imagemagick=8:6.9.11.60+dfsg-1.3+deb11u1                                 \
      jpegoptim=1.4.6-1                                                        \
      optipng=0.7.7-1+b1                                                       \
      pngquant=2.13.1-1                                                        \
 && curl -sL https://deb.nodesource.com/setup_18.x  | bash -                   \
 && apt-get -y --no-install-recommends install nodejs=18.14.2-deb-1nodesource1 \
    # Install MJML parser required by email engine.
 && npm install -g mjml@4.4.1                                                  \
 && apt-get clean                                                              \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /cl2_back

RUN gem install bundler:2.3.20

COPY --from=dependency_files /app .
RUN bundle install

COPY back/. .

EXPOSE 4000

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
