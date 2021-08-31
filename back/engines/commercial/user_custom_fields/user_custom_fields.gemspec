$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "user_custom_fields/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "user_custom_fields"
  s.version     = UserCustomFields::VERSION
  s.authors     = ["CitizenLab"]
  s.email       = ["developers@citizenlab.co"]
  s.licenses    = ['CitizenLab Commercial License']
  s.summary     = "CitizenLab extension: Allow admins to define custom registration fields."

  s.files = Dir["{app,config,db,lib}/**/*", "README.md"]

  s.add_dependency "rails", "~> 6.1"
  s.add_dependency "pundit", "~> 2.0"
  s.add_dependency "active_model_serializers", "~> 0.10.7"
  s.add_dependency "ros-apartment", ">=2.9.0"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
