# frozen_string_literal: true

require_relative 'lib/remove_vendor_branding/version'

Gem::Specification.new do |s|
  s.name        = 'remove_vendor_branding'
  s.version     = RemoveVendorBranding::VERSION
  s.summary     = 'Remove CitizenLab Branding'
  s.authors     = ['CitizenLab']
  s.licenses    = ['CitizenLab Commercial License V1']
  s.files = Dir['{app,config,db,lib}/**/*']
end
