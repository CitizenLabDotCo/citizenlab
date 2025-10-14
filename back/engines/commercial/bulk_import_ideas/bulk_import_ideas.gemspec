# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'bulk_import_ideas/version'

Gem::Specification.new do |spec|
  spec.name        = 'bulk_import_ideas'
  spec.version     = BulkImportIdeas::VERSION
  spec.authors     = ['CitizenLab']
  spec.email       = ['developers@citizenlab.co']
  spec.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']
  spec.summary     = 'Create many ideas at once by importing an XLSX sheet.'

  spec.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  spec.add_dependency 'active_model_serializers', '~> 0.10.7'
  spec.add_dependency 'pundit', '~> 2.0'
  spec.add_dependency 'rails', '~> 7.2'
  spec.add_dependency 'ros-apartment', '>=2.9.0'

  spec.add_development_dependency 'rspec_api_documentation'
  spec.add_development_dependency 'rspec-rails'
end
