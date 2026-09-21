# frozen_string_literal: true

class McpServer::Tools::UpdatePlatformConfig < McpServer::BaseTool
  def name = 'update_platform_config'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: true # Fetches logo/favicon from arbitrary public URLs.
    }
  end

  def description
    <<~DESC.squish
      Updates the platform's branding and core settings: brand colours, organization
      name, logo, favicon, languages, timezone, currency, country and SEO metadata.
      Partial update — only the fields you pass change, and *_multiloc fields merge per
      locale. Read the current values with get_platform_branding first. Only available
      on demo and trial platforms.
    DESC
  end

  def input_schema
    {
      properties: {
        colors: {
          type: 'object',
          properties: {
            main: { type: 'string', description: '6-digit HEX, e.g. #163A7D.' },
            secondary: { type: 'string', description: '6-digit HEX.' },
            text: { type: 'string', description: '6-digit HEX.' }
          },
          additionalProperties: false
        },
        organization_name_multiloc: { **multiloc_schema, description: 'How the organization is named across the platform.' },
        locales: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
          description: 'Platform languages as locale codes (e.g. en, nl-BE, fr-BE, cy-GB).'
        },
        timezone: { type: 'string', description: 'IANA timezone, e.g. Europe/London.' },
        currency: { type: 'string', description: 'ISO 4217 currency code, e.g. GBP.' },
        country_code: { type: 'string', description: 'ISO 3166-1 alpha-2 country code, e.g. GB.' },
        meta_title_multiloc: { **multiloc_schema, description: 'SEO / browser-tab title.' },
        meta_description_multiloc: { **multiloc_schema, description: 'SEO / social-share description.' },
        logo_url: { type: 'string', format: 'uri', description: 'Public URL of the logo image to download.' },
        favicon_url: { type: 'string', format: 'uri', description: 'Public URL of the favicon image to download.' }
      },
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    DEMO_ONLY_MESSAGE = 'Platform config can only be updated on demo and trial platforms.'

    # MCP param key => core settings key.
    CORE_KEYS = {
      organization_name_multiloc: 'organization_name',
      locales: 'locales',
      timezone: 'timezone',
      currency: 'currency',
      country_code: 'country_code',
      meta_title_multiloc: 'meta_title',
      meta_description_multiloc: 'meta_description'
    }.freeze

    def run
      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?

      config = AppConfiguration.instance
      authorize(config, :update?)

      core = core_updates
      if core.empty? && params[:logo_url].blank? && params[:favicon_url].blank?
        return error('Provide at least one field to update.')
      end

      # deep_merge preserves untouched core keys, feature blocks, and merges *_multiloc
      # fields per locale (arrays like locales replace wholesale).
      config.settings = config.settings.deep_merge('core' => core)
      config.remote_logo_url = params[:logo_url] if params[:logo_url]
      config.remote_favicon_url = params[:favicon_url] if params[:favicon_url]

      SideFxAppConfigurationService.new.before_update(config, current_user)
      config.save!
      SideFxAppConfigurationService.new.after_update(config, current_user)

      response(
        "Updated platform config of #{config.host}",
        structured: McpServer::PlatformBranding.structured(config)
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    def core_updates
      updates = {}
      CORE_KEYS.each { |param_key, setting_key| updates[setting_key] = params[param_key] if params[param_key] }
      if (colors = params[:colors])
        updates['color_main'] = colors[:main] if colors[:main]
        updates['color_secondary'] = colors[:secondary] if colors[:secondary]
        updates['color_text'] = colors[:text] if colors[:text]
      end
      updates
    end
  end
end
