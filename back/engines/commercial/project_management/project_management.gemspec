$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "project_management/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "project_management"
  spec.version     = ProjectManagement::VERSION
  spec.authors     = ["CitizenLab"]
  spec.licenses    = ['CitizenLab Commercial License V1']
  spec.summary     = "CitizenLab extension: Adds the role of project moderator."

  spec.files = Dir["{app,config,db,lib}/**/*", "README.md"]

  spec.add_dependency "rails", "~> 6.1"
end
