# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'onboarding/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'onboarding'
  s.version     = Onboarding::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']
  s.summary     = 'Show onboarding messages to citizens and track their state'

  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'active_model_serializers', '~> 0.10.7'
  s.add_dependency 'kaminari', '~> 1.2'
  s.add_dependency 'pundit', '~> 2.0'
  s.add_dependency 'rails', '~> 7.2'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
