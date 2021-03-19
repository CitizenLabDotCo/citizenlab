$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "project_visibility/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "project_visibility"
  spec.version     = ProjectVisibility::VERSION
  spec.authors     = ["CitizenLab"]
  spec.email       = ["developers@citizenlab.co"]
  spec.summary     = "CitizenLab extension: Allows to configure project visibility."
  spec.license     = 'CitizenLab Commercial License'

  spec.files = Dir["{app,config,db,lib}/**/*", "README.md"]

  spec.add_dependency "rails", "~> 6.0.3", ">= 6.0.3.2"
end
