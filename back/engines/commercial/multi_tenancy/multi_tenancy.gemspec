# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'multi_tenancy/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = 'multi_tenancy'
  spec.version     = MultiTenancy::VERSION
  spec.required_ruby_version = '>= 2.7.6'
  spec.authors     = ['Adrien Dessy']
  spec.licenses    = ['CitizenLab Commercial License V2']
  spec.email       = ['adrien@citizenlab.co']
  spec.summary     = 'Multi-tenancy support for CitizenLab participation platform'

  spec.files = Dir['{app,config,db,lib}/**/*', 'README.md']

  # CitizenLab engines
  spec.add_dependency 'nlp'

  spec.add_dependency 'actionpack-cloudfront', '~> 1.2.0'
  spec.add_dependency 'rails', '~> 6.1'
  spec.add_dependency 'ros-apartment', '>=2.9.0'

  spec.add_development_dependency 'rubocop', '1.36.0'
  spec.add_development_dependency 'rubocop-performance', '1.14.3'
  spec.add_development_dependency 'rubocop-rails', '2.19.1'
  spec.add_development_dependency 'rubocop-rspec', '2.12.1'
  spec.metadata['rubygems_mfa_required'] = 'true'
end
