# frozen_string_literal: true

require_relative 'lib/report_builder/version'

Gem::Specification.new do |spec|
  spec.name        = 'report_builder'
  spec.version     = ReportBuilder::VERSION
  spec.authors     = ['CitizenLab']
  spec.email       = ['developers@citizenlab.co']
  spec.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']
  spec.summary     = 'Create customized reports.'

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  spec.metadata['allowed_push_host'] = 'www.citizenlab.co'

  spec.files = Dir['{app,config,db,lib}/**/*', 'Rakefile']

  spec.add_dependency 'analytics'
  spec.add_dependency 'content_builder'
  spec.add_dependency 'rails', '~> 7.2'
  spec.add_dependency 'user_custom_fields'
end
