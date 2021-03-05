$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "custom_topics/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "custom_topics"
  s.version     = CustomTopics::VERSION
  s.authors     = ['CitizenLab']
  s.email       = ['developers@citizenlab.co']
  s.summary     = 'CitizenLab extension: Allows customization of topics.'

  s.files = Dir["{app,config,db,lib}/**/*", "README.md"]

end
