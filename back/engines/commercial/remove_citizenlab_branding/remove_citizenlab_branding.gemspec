require_relative 'lib/remove_citizenlab_branding/version'

Gem::Specification.new do |s|
  s.name        = 'remove_citizenlab_branding'
  s.version     = RemoveCitizenlabBranding::VERSION
  s.summary     = 'Remove CitizenLab Branding'
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V1']
  s.files = Dir['{app,config,db,lib}/**/*']
end
