$:.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'idea_assignment/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = 'idea_assignment'
  spec.version     = IdeaAssignment::VERSION
  spec.authors     = ['CitizenLab']
  spec.summary     = 'A plugin that allows the assignment of users to ideas.'
  spec.description = 'A plugin that allows the assignment of users to ideas.'
  spec.licenses    = ['CitizenLab Commercial License V1']

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise 'RubyGems 2.0 or newer is required to protect against ' \
      'public gem pushes.'
  end

  spec.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  spec.add_dependency 'email_campaigns'
  spec.add_dependency 'rails', '~> 6.1'
end
