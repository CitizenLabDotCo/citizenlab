$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "id_id_card_lookup/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "id_id_card_lookup"
  s.version     = IdIdCardLookup::VERSION
  s.summary     = "Verification using manual ID card numbers against uploaded csv file"
  s.authors     = ["CitizenLab"]
  s.licenses    = ['CitizenLab Commercial License V1']
  s.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.1"
  s.add_dependency "verification"
  s.add_dependency "savon", "~> 2.12.0"
  s.add_dependency "admin_api"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
