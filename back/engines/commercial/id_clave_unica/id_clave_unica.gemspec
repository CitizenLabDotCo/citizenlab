$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "id_clave_unica/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "id_clave_unica"
  s.version     = IdClaveUnica::VERSION
  s.summary     = "Authentication and verification using the Chilean Clave Unica"
  s.authors     = ["CitizenLab"]
  s.licenses    = ['CitizenLab Commercial License V1']
  s.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.1"
  s.add_dependency "verification"
  s.add_dependency "omniauth_openid_connect", "~> 0.3.3"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
