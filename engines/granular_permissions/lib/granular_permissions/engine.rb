module GranularPermissions
  class Engine < ::Rails::Engine
    isolate_namespace GranularPermissions
    config.generators.api_only = true
  end
end
