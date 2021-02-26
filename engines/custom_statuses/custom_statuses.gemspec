$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "custom_statuses/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "custom_statuses"
  s.version     = CustomStatuses::VERSION
  s.authors     = ["Citizenlab"]
  s.email       = ["developers@citizenlab.co"]
  s.summary     = "Allows customization of the idea and initiative statuses by exposing the #create, #update and #destroy actions for the statuses' endpoints"

  s.files = Dir["{app,config,db,lib}/**/*", "README.md"]

  s.add_dependency "rails", "~> 6.0.0"
  s.add_dependency "pundit", "~> 2.0"
  s.add_dependency "active_model_serializers", "~> 0.10.7"
  s.add_dependency "apartment", "~> 2.2.1"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"
end
