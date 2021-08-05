$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "granular_permissions/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "granular_permissions"
  spec.version     = GranularPermissions::VERSION
  spec.authors     = ["CitizenLab"]
  spec.summary     = "CitizenLab extension: granular permissions for actions in the scope of a participation context."
  spec.license     = 'CitizenLab Commercial License V1'

  spec.files = Dir["{app,config,db,lib}/**/*", "README.md"]

  spec.add_dependency "rails", "~> 6.1"
  spec.add_dependency "pundit", "~> 2.0"
end
