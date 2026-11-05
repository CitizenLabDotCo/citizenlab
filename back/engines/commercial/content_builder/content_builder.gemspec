# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'content_builder/version'

Gem::Specification.new do |spec|
  spec.name        = 'content_builder'
  spec.version     = ContentBuilder::VERSION
  spec.authors     = ['CitizenLab']
  spec.email       = ['developers@citizenlab.co']
  spec.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']
  spec.summary     = 'Customize the layouts for different parts of the platform (project page, home page etc.)'

  spec.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  spec.add_dependency 'active_model_serializers', '~> 0.10.7'
  spec.add_dependency 'nanoid', '~> 2.0'
  spec.add_dependency 'pundit', '~> 2.0'
  spec.add_dependency 'rails', '~> 7.2'
  spec.add_dependency 'ros-apartment', '>=2.9.0'

  spec.add_development_dependency 'rspec_api_documentation'
  spec.add_development_dependency 'rspec-rails'
end
