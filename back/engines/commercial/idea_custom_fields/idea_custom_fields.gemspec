# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'idea_custom_fields/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = 'idea_custom_fields'
  spec.version     = IdeaCustomFields::VERSION
  spec.authors     = ['CitizenLab']
  spec.summary     = 'Custom Idea Fields'
  spec.description = 'Admin and project managers can specify which idea form fields to enable/disable or make mandatory.'
  spec.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise 'RubyGems 2.0 or newer is required to protect against ' \
          'public gem pushes.'
  end

  spec.files = Dir['{app,config,db,lib}/**/*', 'Rakefile']

  spec.add_dependency 'rails', '~> 7.2'
end
