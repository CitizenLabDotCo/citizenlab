$:.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'user_confirmation/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = 'user_confirmation'
  spec.version     = UserConfirmation::VERSION
  spec.authors     = ['CitizenLab']
  spec.licenses    = ['AGPLv3']
  spec.summary     = 'Add email and phone confirmation functionality to users.'

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  spec.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  spec.add_dependency 'rails', '~> 6.1'
end
