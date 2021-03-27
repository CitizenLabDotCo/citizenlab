$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "surveys/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "surveys"
  s.version     = Surveys::VERSION
  s.authors     = ["Koen Gremmelprez"]
  s.email       = ["koen@citizenlab.co"]
  s.licenses    = ['AGPLv3']
  s.summary     = "Contains everything to support surveys as a participation method"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.0.0"
  s.add_dependency "pundit", "~> 2.0"
  s.add_dependency "kaminari", "~> 1.2"
  s.add_dependency "active_model_serializers", "~> 0.10.7"
  s.add_dependency "apartment", "~> 2.2.1"
  s.add_dependency "httparty", "~> 0.16.2"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
