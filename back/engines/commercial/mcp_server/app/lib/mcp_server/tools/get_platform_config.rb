# frozen_string_literal: true

class McpServer::Tools::GetPlatformConfig < McpServer::BaseTool
  def name = 'get_platform_config'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Reads the platform's branding and core settings: organization name, locales,
      brand colours, logo and favicon URLs, timezone, currency and country.
    DESC
  end

  def input_schema = { properties: {}, additionalProperties: false }

  class Runner < McpServer::BaseTool::Runner
    def run
      config = AppConfiguration.instance
      response(
        "Config of platform #{config.host}",
        structured: McpServer::PlatformConfig.structured(config)
      )
    end
  end
end
