source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end


# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
# gem 'rails', '~> 5.1.0.beta1'
gem 'rails', '~> 5.1.4'
# Use postgresql as the database for Active Record
gem 'pg', '~> 0.18'
# Use Puma as the app server
gem 'puma', '~> 3.7'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
# gem 'jbuilder', '~> 2.5'
# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 3.0'
# Use ActiveModel has_secure_password
gem 'bcrypt', '~> 3.1.7'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

# Use Rack CORS for handling Cross-Origin Resource Sharing (CORS), making cross-origin AJAX possible
gem 'rack-cors'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'faker'
  gem 'factory_bot_rails'
  gem 'rspec_api_documentation'
  gem 'rspec-rails'
  gem 'database_cleaner'
  gem 'ci_reporter_rspec'
  gem 'simplecov'
  gem 'simplecov-rcov'
end

group :development do
  gem 'listen', '>= 3.0.5', '< 3.2'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'redcarpet'
  gem 'mongo', '~> 2.5'
end

group :test do
  gem 'shoulda-matchers', '~> 3.1'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

gem "pundit", "~> 1.1.0"
gem "active_model_serializers", "~> 0.10.7"
gem "knock", "~> 2.1.1", github: 'ngty/knock', ref: '97fb32f59b2027c808964b875be2fff22400da1d'
gem "sidekiq", "~> 5.0.5"
gem "sidekiq-cron", "~> 0.6.3"
gem "apartment", "~> 2.1.0"
gem "apartment-sidekiq", "~> 1.2.0"
gem "carrierwave", "~> 1.2.2"
gem "kaminari", "~> 1.0.1"
gem "activerecord_json_validator", "~> 1.2.0"

gem "rest-client"
gem "fog-aws"
gem "mini_magick"
gem "carrierwave-base64", "~> 2.6"
gem "awesome_nested_set", "~> 3.1.3"
gem "pg_search", "~> 2.1.2"
gem "counter_culture", "~> 1.0"
gem "liquid", "~> 4.0"
gem "premailer-rails", "~> 1.9.6"
gem 'groupdate', "~> 3.2.0"
gem 'rubyzip', '~> 1.2.1'
gem 'axlsx', '2.1.0.pre', github: 'randym/axlsx', ref: 'c8ac844572b25fda358cc01d2104720c4c42f450'
gem 'rgeo-geojson'

gem 'activerecord-postgis-adapter', '~> 5.0'
gem 'simple_segment', '~> 0.2.1'
gem 'okcomputer'
gem 'sentry-raven'
gem 'omniauth', '~> 1.7.1'
gem 'omniauth-facebook'
gem 'omniauth-google-oauth2'
gem 'omniauth-twitter'
# gem 'omniauth-mydigipass', github: 'vasco-data-security/omniauth-mydigipass', branch: 'oauth-eid-specification'
gem "bunny", ">= 2.7.2"
gem 'carrierwave-imageoptimizer'
gem 'scenic'

gem 'public_api', path: 'engines/public_api'
