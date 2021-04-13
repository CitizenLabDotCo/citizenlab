$:.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'email_confirmation/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = 'email_confirmation'
  spec.version     = EmailConfirmation::VERSION
  spec.authors     = ['CitizenLab']
  spec.licenses    = ['AGPLv3']
  spec.summary     = 'Add email confirmation functionality to users.'

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  spec.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  spec.add_dependency 'rails', '~> 6.0.3', '>= 6.0.3.5'
end
