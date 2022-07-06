# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

require_relative 'lib/analytics/version'

Gem::Specification.new do |s|
  s.name        = 'analytics'
  s.version     = Analytics::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V1']
  s.summary     = 'Reporting flow: from inputs to insights'

  s.files = Dir['{app,config,db,lib}/**/*', 'MIT-LICENSE', 'Rakefile', 'README.md']

  s.add_dependency 'rails', '~> 6.1.6'
  s.add_dependency 'scenic' # Is this in the right place?

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
