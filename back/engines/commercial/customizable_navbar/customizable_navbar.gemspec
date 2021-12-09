$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'customizable_navbar/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'customizable_navbar'
  s.version     = CustomizableNavbar::VERSION
  s.authors     = ['CitizenLab']
  s.email       = ['developers@citizenlab.co']
  s.licenses    = ['CitizenLab Commercial License']
  s.summary     = 'Add, remove, reposition and rename items in the navbar'

  s.files = Dir['{app,config,db,lib}/**/*', 'README.md']

  s.add_dependency 'active_model_serializers', '~> 0.10.7'
  s.add_dependency 'pundit', '~> 2.0'
  s.add_dependency 'rails', '~> 6.1'
  s.add_dependency 'ros-apartment', '>=2.9.0'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
