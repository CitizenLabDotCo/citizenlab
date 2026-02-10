# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'machine_translations/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'machine_translations'
  s.version     = MachineTranslations::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = [Gem::Licenses::NONSTANDARD] # ['CitizenLab Commercial License V2']
  s.summary     = 'Automatically translates content (ideas/comments) through machine translation'

  s.files = Dir['{app,config,db,lib}/**/*', 'README.md']

  s.add_dependency 'active_model_serializers', '~> 0.10.7'
  s.add_dependency 'pundit', '~> 2.0'
  s.add_dependency 'rails', '~> 7.2'
  s.add_dependency 'ros-apartment', '>=2.9.0'

  s.add_dependency 'easy_translate'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
