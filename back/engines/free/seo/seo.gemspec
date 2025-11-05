# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'seo/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = 'seo'
  spec.version     = Seo::VERSION
  spec.authors     = ['CitizenLab']
  spec.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']
  spec.summary     = 'The engine responsible for delivering the sitemap, scraping facebook and propagating changes to google.'

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise 'RubyGems 2.0 or newer is required to protect against ' \
          'public gem pushes.'
  end

  spec.files = Dir['{app,config,db,lib}/**/*', 'Rakefile', 'README.md']

  spec.add_dependency 'aws-sdk-route53'
  spec.add_dependency 'google-api-client'
  spec.add_dependency 'httparty'
  spec.add_dependency 'koala'
  spec.add_dependency 'rails', '~> 7.2'
end
