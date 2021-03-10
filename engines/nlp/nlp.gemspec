$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "nlp/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "nlp"
  s.version     = NLP::VERSION
  s.authors     = ["Koen Gremmelprez"]
  s.email       = ["koen@citizenlab.co"]
  s.licenses    = ['CitizenLab Commercial License']
  s.summary     = "Bundle all NLP related functionality neede for backend purposes"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.0.0"
  s.add_dependency "httparty", "~> 0.16.2"
  s.add_dependency "bunny"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
