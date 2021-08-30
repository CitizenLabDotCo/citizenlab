$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "volunteering/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "volunteering"
  s.version     = Volunteering::VERSION
  s.authors     = ["CitizenLab"]
  s.licenses    = ['AGPLv3']
  s.summary     = "Contains everything to support volunteering as a participation method"

  s.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.1"
  s.add_dependency "pundit", "~> 2.0"
  s.add_dependency "kaminari", "~> 1.2"
  s.add_dependency "acts_as_list", "~> 0.9.17"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
