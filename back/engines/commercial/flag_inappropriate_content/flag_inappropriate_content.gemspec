$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "flag_inappropriate_content/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "flag_inappropriate_content"
  s.version     = FlagInappropriateContent::VERSION
  s.authors     = ["CitizenLab"]
  s.email       = ["developers@citizenlab.co"]
  s.licenses    = ['CitizenLab Commercial License']
  s.summary     = "Automatically detect inappropriate content posted to the platform using Natural Language Processing."

  s.files = Dir["{app,config,db,lib}/**/*", "README.md"]

  s.add_dependency "rails", "~> 6.1"
  s.add_dependency "pundit", "~> 2.0"
  s.add_dependency "active_model_serializers", "~> 0.10.7"
  s.add_dependency "ros-apartment", ">=2.9.0"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

  s.add_dependency 'email_campaigns'
  s.add_dependency 'moderation'
end
