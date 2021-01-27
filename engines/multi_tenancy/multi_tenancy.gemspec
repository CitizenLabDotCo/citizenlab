$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "multi_tenancy/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "multi_tenancy"
  spec.version     = MultiTenancy::VERSION
  spec.authors     = ["Adrien Dessy"]
  spec.email       = ["adrien@citizenlab.co"]
  spec.summary     = "Multi-tenancy support for CitizenLab participation platform"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "TODO: Set to 'http://mygemserver.com'"
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  spec.files = Dir["{app,config,db,lib}/**/*", "README.md"]

  spec.add_dependency "rails", "~> 6.0.0"
  spec.add_dependency "apartment", ">= 2.2.1"
  spec.add_dependency "apartment-sidekiq", "~> 1.2.0"
end


