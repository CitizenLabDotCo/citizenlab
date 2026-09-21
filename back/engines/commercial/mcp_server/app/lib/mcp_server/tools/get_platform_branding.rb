# frozen_string_literal: true

class McpServer::Tools::GetPlatformBranding < McpServer::BaseTool
  def name = 'get_platform_branding'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Reads the platform's branding and core settings: organization name, locales,
      brand colours, logo and favicon URLs, timezone, currency, country, SEO metadata
      and style customizations (fonts, header colours, etc.).
    DESC
  end

  def input_schema = { properties: {}, additionalProperties: false }

  class Runner < McpServer::BaseTool::Runner
    def run
      config = AppConfiguration.instance
      response(
        "Branding of platform #{config.host}",
        structured: McpServer::PlatformBranding.structured(config)
      )
    end
  end
end
