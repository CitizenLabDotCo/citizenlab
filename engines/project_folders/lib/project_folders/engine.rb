module ProjectFolders
  class Engine < ::Rails::Engine
    isolate_namespace ProjectFolders
    config.generators.api_only = true
  end
end
