$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "project_permissions/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "project_permissions"
  spec.version     = ProjectPermissions::VERSION
  spec.authors     = ["CitizenLab"]
  spec.summary     = "CitizenLab extension: Adds new configurations options for project permissions."
  spec.licenses    = ['AGPLv3']

  spec.files = Dir["{app,config,db,lib}/**/*", "README.md"]

  spec.add_dependency "rails", "~> 6.1"
end
