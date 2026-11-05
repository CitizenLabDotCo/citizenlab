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
  spec.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']
  spec.email       = ['adrien@citizenlab.co']
  spec.summary     = 'Multi-tenancy support for CitizenLab participation platform'

  spec.files = Dir['{app,config,db,lib}/**/*', 'README.md']

  spec.add_dependency 'rails', '~> 7.2'
  spec.add_dependency 'ros-apartment', '>=2.9.0'

  spec.add_development_dependency 'rubocop', '1.65.1'
  spec.add_development_dependency 'rubocop-performance', '1.23.1'
  spec.add_development_dependency 'rubocop-rails', '2.28.0'
  spec.add_development_dependency 'rubocop-rspec', '2.29.2'
  spec.metadata['rubygems_mfa_required'] = 'true'
end
