# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'decidim_importer/version'

Gem::Specification.new do |spec|
  spec.name        = 'decidim_importer'
  spec.version     = DecidimImporter::VERSION
  spec.authors     = ['CitizenLab']
  spec.email       = ['developers@citizenlab.co']
  spec.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']
  spec.summary     = 'Import a Decidim platform from flat XLSX exports into a tenant template.'

  spec.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  spec.add_dependency 'pundit', '~> 2.0'
  spec.add_dependency 'rails', '~> 7.2'
  spec.add_dependency 'ros-apartment', '>=2.9.0'

  spec.add_development_dependency 'rspec-rails'
end
