$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "matomo/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "matomo"
  s.version     = Matomo::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V1']
  s.summary     = "Enables sending front-end events to matomo for analytics"

  s.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  s.add_dependency 'rails', '~> 6.1'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
