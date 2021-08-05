$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require 'clusterings/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'clusterings'
  s.version     = Clusterings::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V1']
  s.summary     = 'Adds an extra method to classify inputs with nlp.'

  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'ros-apartment', '>=2.9.0'
  s.add_dependency 'pundit', '~> 2.0'
  s.add_dependency 'rails', '~> 6.1'
  s.add_dependency 'nlp'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
