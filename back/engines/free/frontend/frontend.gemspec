$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "frontend/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "frontend"
  s.version     = Frontend::VERSION
  s.authors     = ["CitizenLab"]
  s.licenses    = ['AGPLv3']
  s.summary     = "Contains all functionoality needed for cl2-front, unrelated to any core business domain"

  s.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.1"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
