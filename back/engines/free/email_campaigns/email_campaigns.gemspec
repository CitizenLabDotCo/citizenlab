# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'email_campaigns/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'email_campaigns'
  s.version     = EmailCampaigns::VERSION
  s.authors     = ['CitizenLab']
  s.summary     = 'Sends out the campaign emails as scheduled'
  s.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']

  s.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  s.add_dependency 'rails', '~> 7.0'
  s.add_dependency 'pundit', '~> 2.0'
  s.add_dependency 'kaminari', '~> 1.2'
  s.add_dependency 'active_model_serializers', '~> 0.10.7'
  s.add_dependency 'ice_cube'
  s.add_dependency 'mailgun-ruby', '~>1.2.0'
  s.add_dependency 'liquid', '>= 4', '< 6'

  s.add_development_dependency 'capybara', '~> 3.39'
  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
