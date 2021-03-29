$:.push File.expand_path("lib", __dir__)

# Maintain your gem's version:
require "project_folders/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |spec|
  spec.name        = "project_folders"
  spec.version     = ProjectFolders::VERSION
  spec.authors     = ["Adrien Dessy"]
  spec.licenses    = ['CitizenLab Commercial License']
  spec.email       = ["adrien@citizenlab.co"]
  spec.summary     = "Project folders for CitizenLab participation platform"

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata["allowed_push_host"] = "Set to 'http://mygemserver.com'" # todo
  else
    raise "RubyGems 2.0 or newer is required to protect against " \
      "public gem pushes."
  end

  spec.files = Dir["{app,config,db,lib}/**/*", "Rakefile", "README.md"]

  spec.add_dependency "rails", "~> 6.0.3", ">= 6.0.3.2"

  spec.add_development_dependency "sqlite3"
end
