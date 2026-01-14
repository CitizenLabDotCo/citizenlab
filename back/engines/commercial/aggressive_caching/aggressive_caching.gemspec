# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'aggressive_caching/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'aggressive_caching'
  s.version     = AggressiveCaching::VERSION
  s.summary     = 'Optionally enable aggressive caching for high traffic situations'
  s.authors     = ['CitizenLab']
  s.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']
  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'actionpack-action_caching', '~> 1.2'
  s.add_dependency 'rails', '~> 7.2'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
