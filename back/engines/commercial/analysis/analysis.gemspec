# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'analysis/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'analysis'
  s.version     = Analysis::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']
  s.summary     = 'Analyze and summarize textual content, assisted by AI'

  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'rails', '~> 7.0'
  s.add_dependency 'ruby-openai', '>= 6.3', '< 8.0'
  s.add_dependency 'tiktoken_ruby', '~> 0.0.7'
  s.add_dependency 'concurrent-ruby', '~> 1.2.3'
  s.add_dependency 'distribution', '~> 0.8.0'
  s.add_dependency 'prime', '~> 0.1.3'
  s.add_dependency 'matrix', '~> 0.4.2'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
