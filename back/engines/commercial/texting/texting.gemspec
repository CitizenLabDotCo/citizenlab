require_relative "lib/texting/version"

Gem::Specification.new do |s|
  s.name        = 'texting'
  s.version     = Texting::VERSION
  s.summary     = 'Texting users via SMS'
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V1']
  s.files = Dir['{app,config,db,lib}/**/*']

  s.add_dependency 'rails', '~> 6.1'
  s.add_dependency 'twilio-ruby', '~> 5.65'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
