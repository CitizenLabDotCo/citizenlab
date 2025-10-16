# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'custom_id_methods/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'custom_id_methods'
  s.version     = CustomIdMethods::VERSION
  s.summary     = 'Custom SSO authentication and verification methods'
  s.authors     = ['Go Vocal']
  s.licenses    = [Gem::Licenses::NONSTANDARD] # ['Go Vocal Commercial License V2']
  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'rails', '~> 7.0'
  s.add_dependency 'omniauth_openid_connect'
  s.add_dependency 'omniauth-auth0', '~> 2.0' # auth0
  s.add_dependency 'id_id_card_lookup' # claveunica
  s.add_dependency 'savon', '>= 2.12', '< 2.15' # cow
  s.add_dependency 'httparty' # gent rrn
  s.add_dependency 'omniauth-saml', '~> 2.2.0' # nemlog-in

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
