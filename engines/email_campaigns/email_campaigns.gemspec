$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "email_campaigns/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "email_campaigns"
  s.version     = EmailCampaigns::VERSION
  s.authors     = ["Koen Gremmelprez"]
  s.email       = ["koen@citizenlab.co"]
  s.summary     = "Sends out the campaign emails as scheduled"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 5.1.5"
  s.add_dependency "pundit", "~> 1.1.0"
  s.add_dependency "kaminari", "~> 1.1.1"
  s.add_dependency "active_model_serializers", "~> 0.10.7"
  # s.add_dependency "knock", "~> 2.1.1"
  s.add_dependency "apartment", "~> 2.1.0"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

  s.add_dependency 'ice_cube'
end
