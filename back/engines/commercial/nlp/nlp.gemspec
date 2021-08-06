$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "nlp/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "nlp"
  s.version     = NLP::VERSION
  s.authors     = ["CitizenLab"]
  s.licenses    = ['CitizenLab Commercial License V1']
  s.summary     = "Bundle all NLP related functionality neede for backend purposes"

  s.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.1"
  s.add_dependency "httparty", "~> 0.16.2"
  s.add_dependency "bunny"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
