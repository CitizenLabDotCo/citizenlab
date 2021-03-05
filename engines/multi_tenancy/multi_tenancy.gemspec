$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "multi_tenancy/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "multi_tenancy"
  spec.version     = MultiTenancy::VERSION
  spec.authors     = ["Adrien Dessy"]
  spec.licenses    = ['CitizenLab Commercial License']
  spec.email       = ["adrien@citizenlab.co"]
  spec.summary     = "Multi-tenancy support for CitizenLab participation platform"

  spec.files = Dir["{app,config,db,lib}/**/*", "README.md"]

  spec.add_dependency "rails", "~> 6.0.0"
  spec.add_dependency "apartment", ">= 2.2.1"
end


