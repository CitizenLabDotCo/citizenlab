$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'id_vienna_saml/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'id_vienna_saml'
  s.version     = IdViennaSaml::VERSION
  s.summary     = "Authentication method using Vienna's Standardportal (SAML)"
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V1']
  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'omniauth-saml', '~> 1.10.3'
  s.add_dependency 'rails', '~> 6.1'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
