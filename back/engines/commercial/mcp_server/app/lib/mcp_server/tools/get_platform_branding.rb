# frozen_string_literal: true

class McpServer::Tools::GetPlatformBranding < McpServer::BaseTool
  def name = 'get_platform_branding'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Reads the platform's branding: organization name, locales, brand colours,
      logo URLs and style customizations (fonts, header colours, etc.). Use it to
      make generated content match the platform's look and feel.
    DESC
  end

  def input_schema = { properties: {}, additionalProperties: false }

  class Runner < McpServer::BaseTool::Runner
    def run
      config = AppConfiguration.instance

      response(
        "Branding of platform #{config.host}",
        structured: {
          organization_name_multiloc: config.settings('core', 'organization_name'),
          locales: config.settings('core', 'locales'),
          colors: {
            main: config.settings('core', 'color_main'),
            secondary: config.settings('core', 'color_secondary'),
            text: config.settings('core', 'color_text')
          },
          logo_urls: (config.logo.versions.transform_values(&:url) if config.logo.file),
          style: config.style
        }
      )
    end
  end
end
