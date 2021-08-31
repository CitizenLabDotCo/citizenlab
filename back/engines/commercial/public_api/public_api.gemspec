$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "public_api/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "public_api"
  s.version     = PublicApi::VERSION
  s.authors     = ["CitizenLab"]
  s.licenses    = ['CitizenLab Commercial License V1']
  s.summary     = "Rails engine that provides the endpoints for the public CL2 api"

  s.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.1"
  s.add_dependency "pundit", "~> 2.0"
  s.add_dependency "kaminari", "~> 1.2"
  s.add_dependency "active_model_serializers", "~> 0.10.7"
  s.add_dependency "knock"
  s.add_dependency "ros-apartment", ">=2.9.0"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
