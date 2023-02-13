# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'posthog_integration/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'posthog_integration'
  s.version     = PosthogIntegration::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V2']
  s.summary     = 'Sending usage events to PostHog, a product analytics tools. Only for admins.'

  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'rails', '~> 6.1'
  s.add_dependency 'posthog-ruby', '~> 2.1'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
