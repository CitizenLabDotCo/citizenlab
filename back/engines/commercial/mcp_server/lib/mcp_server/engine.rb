module McpServer
  class Engine < ::Rails::Engine
    isolate_namespace McpServer
    config.generators.api_only = true
  end
end
