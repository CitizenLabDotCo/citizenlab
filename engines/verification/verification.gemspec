$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "verification/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "verification"
  s.version     = Verification::VERSION
  s.authors     = ["Koen Gremmelprez"]
  s.email       = ["koen@citizenlab.co"]
  s.licenses    = ['CitizenLab Commercial License']
  s.summary     = "Bundles the code for all verification methods: Is a citizen who she says she is?"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 6.0.0"
  s.add_dependency "pundit", "~> 2.0"
  s.add_dependency "apartment", "~> 2.2.1"
  s.add_dependency "savon", "~> 2.12.0"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
