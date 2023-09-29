# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'analysis/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'analysis'
  s.version     = Analysis::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V2']
  s.summary     = 'Analyze and summarize textual content, assisted by AI'

  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'rails', '~> 7.0'
  s.add_dependency 'nlpcloud', '~> 1.0'
  s.add_dependency 'ruby-openai', '~> 4.2'
  s.add_dependency 'tiktoken_ruby', '~> 0.0.5'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
