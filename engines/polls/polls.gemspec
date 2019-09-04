$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "polls/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "polls"
  s.version     = Polls::VERSION
  s.authors     = ["Koen Gremmelprez"]
  s.email       = ["koen@citizenlab.co"]
  s.summary     = "Contains everything to support polling as a participation method"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]

  s.add_dependency "rails", "~> 5.2.1"
  s.add_dependency "pundit", "~> 2.0"
  s.add_dependency "kaminari", "~> 1.1.1"
  s.add_dependency "apartment", "~> 2.2.0"
  s.add_dependency "apartment-sidekiq"

  s.add_development_dependency "rspec_api_documentation"
  s.add_development_dependency "rspec-rails"

end
