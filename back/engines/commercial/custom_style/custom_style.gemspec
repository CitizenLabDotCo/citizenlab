$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "custom_style/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "custom_style"
  spec.version     = CustomStyle::VERSION
  spec.authors     = ["Adrien Dessy"]
  spec.email       = ["adrien@citizenlab.co"]
  spec.summary     = "Additional styling options for CitizenLab participation platform."

  spec.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  spec.add_dependency "rails", "~> 6.0.0"
end
