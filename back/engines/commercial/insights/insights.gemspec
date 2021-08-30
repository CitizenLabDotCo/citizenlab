# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('../lib', __FILE__)

# Maintain your gem's version:
require 'insights/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'insights'
  s.version     = Insights::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V1']
  s.summary     = 'Reporting flow: from inputs to insights'

  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'rails', '~> 6.1'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
