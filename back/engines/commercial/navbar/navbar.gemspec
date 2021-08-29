$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'navbar/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'navbar'
  s.version     = Navbar::VERSION
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V1']
  s.summary     = 'CitizenLab extension: Navbar allows to edit and reposition the navbar items.'

  s.files = Dir['{app,config,db,lib}/**/*', 'README.md']
end
