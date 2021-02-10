# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('../lib', __FILE__)

# Maintain your gem's version:
require 'tagging/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'tagging'
  s.version     = Tagging::VERSION
  s.authors     = ['Sara Boisseau']
  s.email       = ['sara@citizenlab.co']
  s.summary     = 'Tags content from CitizenLab platform for processing'

  s.files = Dir['{app,config,db,lib}/**/*', 'MIT-LICENSE', 'Rakefile', 'README.md']

  if s.respond_to?(:metadata)
    s.metadata['allowed_push_host'] = "Set to 'http://mygemserver.com'" # todo
  else
    raise 'RubyGems 2.0 or newer is required to protect against ' \
      'public gem pushes.'
  end

  s.add_dependency 'multi_tenancy'
  s.add_dependency 'pundit', '~> 2.0'
  s.add_dependency 'rails', '~> 6.0.0'

  s.add_development_dependency 'rspec-rails'
  s.add_development_dependency 'rspec_api_documentation'
end
