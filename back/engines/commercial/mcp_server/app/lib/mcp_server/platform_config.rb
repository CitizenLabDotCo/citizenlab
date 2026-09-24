# frozen_string_literal: true

# Shared structured view of a platform's branding + exposed core settings, so the
# read (get_platform_config) and write (update_platform_config) tools stay in sync.
module McpServer::PlatformConfig
  module_function

  def structured(config)
    core = config.settings('core')
    {
      organization_name_multiloc: core['organization_name'],
      locales: core['locales'],
      colors: {
        main: core['color_main'],
        secondary: core['color_secondary'],
        text: core['color_text']
      },
      timezone: core['timezone'],
      currency: core['currency'],
      country_code: core['country_code'],
      logo_urls: (config.logo.versions.transform_values(&:url) if config.logo.file),
      favicon_urls: (config.favicon.versions.transform_values(&:url) if config.favicon.file)
    }
  end
end
