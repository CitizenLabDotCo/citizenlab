$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "id_auth0/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "id_auth0"
  s.version     = IdAuth0::VERSION
  s.summary     = "Verification using Auth0"
  s.authors     = ["CitizenLab"]
  s.licenses    = ['CitizenLab Commercial License V1']
  s.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.1"
  s.add_dependency "verification"
  s.add_dependency "omniauth-auth0", "~> 2.0"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
