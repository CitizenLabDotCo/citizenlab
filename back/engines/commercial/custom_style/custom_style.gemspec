$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "custom_style/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "custom_style"
  spec.version     = CustomStyle::VERSION
  spec.authors     = ["CitizenLab"]
  spec.summary     = "Additional styling options for CitizenLab participation platform."
  spec.licenses    = ["CitizenLab Commercial License V1"]

  spec.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  spec.add_dependency "rails", "~> 6.1"
end
