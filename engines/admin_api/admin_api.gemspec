$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "admin_api/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "admin_api"
  s.version     = AdminApi::VERSION
  s.authors     = ["Koen Gremmelprez"]
  s.licenses    = ['CitizenLab Commercial License']
  s.email       = ["koen@citizenlab.co"]
  s.summary     = "Rails engine that provides the endpoints for the admin CL2 api"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.0.0"
  s.add_dependency "active_model_serializers", "~> 0.10.7"
  s.add_dependency "apartment", "~> 2.2.1"
  s.add_dependency "graphql", "~> 1.8.0"
  s.add_dependency "kaminari", "~> 1.2"
  s.add_dependency "custom_style"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"
end
