# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'id_keycloak/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'id_keycloak'
  s.version     = IdKeycloak::VERSION
  s.summary     = 'Verification using Keycloak (ID Porten)'
  s.authors     = ['Go Vocal']
  s.licenses    = [Gem::Licenses::NONSTANDARD] # ['Go Vocal Commercial License V2']
  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'rails', '~> 7.0'
  s.add_dependency 'omniauth_openid_connect', '~> 0.7.1'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
