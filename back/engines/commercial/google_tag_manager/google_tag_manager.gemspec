$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "google_tag_manager/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "google_tag_manager"
  s.version     = GoogleTagManager::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = ['AGPLv3']
  s.summary     = "Google Tag Manager Integration"

  s.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  s.add_dependency 'rails', '~> 6.1'

  s.add_development_dependency 'rspec_api_documentation'
  s.add_development_dependency 'rspec-rails'
end
