# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'custom_maps/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'custom_maps'
  s.version     = CustomMaps::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V1']
  s.summary     = 'Contains everything to configure maps on the platform'

  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'ros-apartment', '>=2.9.0'
  s.add_dependency 'pundit', '~> 2.0'
  s.add_dependency 'rails', '~> 6.1'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
