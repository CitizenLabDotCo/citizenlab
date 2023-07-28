# frozen_string_literal: true

require_relative 'lib/texting/version'

Gem::Specification.new do |s|
  s.name        = 'texting'
  s.version     = Texting::VERSION
  s.summary     = 'Texting users via SMS'
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V2']
  s.files = Dir['{app,config,db,lib}/**/*']

  s.add_dependency 'rails', '~> 7.0'
  s.add_dependency 'smstools', '~> 0.2.2'
  s.add_dependency 'twilio-ruby', '>= 5.77', '< 6.4'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
