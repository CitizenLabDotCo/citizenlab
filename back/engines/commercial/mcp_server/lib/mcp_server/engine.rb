# frozen_string_literal: true

module McpServer
  class Engine < ::Rails::Engine
    isolate_namespace McpServer
    config.generators.api_only = true

    config.to_prepare do
      require 'mcp_server/feature_specification'
      AppConfiguration::Settings.add_feature(McpServer::FeatureSpecification)
    end
  end
end
