# frozen_string_literal: true

require_relative 'lib/action_caching/version'

Gem::Specification.new do |spec|
  spec.name        = 'action-caching'
  spec.version     = ActionCaching::VERSION
  spec.authors     = ['CitizenLab']
  spec.email       = ['engineering@govocal.com']
  spec.summary     = 'Action caching for Rails 7.1+ controllers'
  spec.description = 'A modern replacement for actionpack-action_caching that provides action-level caching for Rails controllers'
  spec.homepage    = 'https://github.com/CitizenLabDotCo/citizenlab'
  spec.license     = 'MIT'

  spec.required_ruby_version = '>= 3.3.0'

  spec.files = Dir['{lib}/**/*', 'README.md', 'Rakefile']
  spec.require_paths = ['lib']

  spec.add_dependency 'actionpack', '>= 7.0'
  spec.add_dependency 'activesupport', '>= 7.0'

  spec.add_development_dependency 'rspec', '~> 3.0'
  spec.add_development_dependency 'rspec-rails'
end
