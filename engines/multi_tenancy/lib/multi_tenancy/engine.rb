module MultiTenancy
  class Engine < ::Rails::Engine
    isolate_namespace MultiTenancy
    config.generators.api_only = true
  end
end
