$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'custom_statuses/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'custom_statuses'
  s.version     = CustomStatuses::VERSION
  s.authors     = ['CitizenLab']
  s.email       = ['developers@citizenlab.co']
  s.summary     = 'CitizenLab extension: Allows customization of idea statuses.'

  s.files = Dir['{app,config,db,lib}/**/*', 'README.md']

  s.add_dependency 'active_model_serializers', '~> 0.10.7'
  s.add_dependency 'pundit', '~> 2.0'
  s.add_dependency 'rails', '~> 6.0.0'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
