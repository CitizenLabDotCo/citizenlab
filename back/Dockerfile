FROM ruby:2.5.3-slim

RUN apt-get update && apt-get install -qq -y --no-install-recommends \
      build-essential nodejs libpq-dev file imagemagick curl git optipng jpegoptim pngquant libgeos-dev libgmp3-dev netcat shared-mime-info

RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_15.x  | bash -
RUN apt-get -y install nodejs

# Install MJML parser required by email engine.
RUN npm install -g mjml@4.4.1

ENV INSTALL_PATH /cl2_back
RUN mkdir -p $INSTALL_PATH
WORKDIR $INSTALL_PATH


COPY citizenlab.config.json citizenlab.config.*.json /
COPY back/Gemfile back/Gemfile.* ./
COPY back/engines ./engines
COPY back/lib/citizen_lab.rb ./lib/

RUN bundle install

COPY back/. .

EXPOSE 4000

CMD puma -C config/puma.rb
