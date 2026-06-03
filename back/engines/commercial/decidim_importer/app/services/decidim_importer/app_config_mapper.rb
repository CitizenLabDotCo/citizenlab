# frozen_string_literal: true

module DecidimImporter
  # Maps a Decidim `01--organization.csv` row onto a Go Vocal **AppConfiguration patch** — a
  # JSON-able hash holding only the fields for which a Go Vocal equivalent exists.
  #
  # The tenant-template deserializer deliberately ignores app configuration, so this is emitted as a
  # *separate* artifact (`<export>.app_config.json`) that an operator merges into the target
  # tenant's AppConfiguration on import (e.g.
  # `app_config.settings.deep_merge!(patch['settings'])` + `app_config.update(patch.except('settings'))`).
  #
  # Only mapped, non-empty keys are included. Decidim fields with no Go Vocal counterpart
  # (social handles, CSP, file-upload limits, available authorizations, …) are intentionally
  # omitted rather than guessed at.
  class AppConfigMapper
    include Parsing

    def initialize(org_row, locale_mapper:, primary_locale:)
      @row = org_row || {}
      @locale_mapper = locale_mapper
      @primary_locale = primary_locale
    end

    # @return [Hash] e.g.
    #   { 'settings' => { 'core' => { 'organization_name' => {…}, 'locales' => [...] } },
    #     'remote_logo_url' => 'https://…' }
    def patch
      result = {}
      core = core_settings
      result['settings'] = { 'core' => core } if core.any?

      logo = present_value(@row['logo'])
      favicon = present_value(@row['favicon'])
      # Image uploaders fetch from `remote_<field>_url` on assignment, same as the template
      # deserializer. The Decidim dev export points these at `http://localhost/…`, which is
      # unreachable from Go Vocal infra — the operator decides whether to keep or drop them.
      result['remote_logo_url'] = logo if logo
      result['remote_favicon_url'] = favicon if favicon

      result
    end

    private

    def core_settings
      core = {}
      put(core, 'organization_name', multiloc(@row['name']))
      put(core, 'meta_description', multiloc(@row['description']))
      put(core, 'locales', mapped_locales)
      put(core, 'timezone', present_value(@row['time_zone']))
      put(core, 'organization_site', present_value(@row['official_url']))
      put(core, 'from_email', smtp_from_email)
      core
    end

    # Decidim `default_locale` first, then `available_locales`, each mapped onto a Go Vocal code.
    def mapped_locales
      available = parse_json(@row['available_locales'])
      list = available.is_a?(Array) ? available : []
      ordered = ([present_value(@row['default_locale'])] + list).compact
      ordered.map { |code| @locale_mapper.map(code) }.uniq
    end

    def smtp_from_email
      smtp = parse_json(@row['smtp_settings'])
      smtp.is_a?(Hash) ? present_value(smtp['from_email']) : nil
    end

    # Decidim multilocs are a `{"fr":"…","en":"…"}` JSON object, or plain text on single-locale
    # platforms; locale codes are mapped onto Go Vocal codes.
    def multiloc(value)
      parsed = parse_json(value)
      if parsed.is_a?(Hash)
        parsed.each_with_object({}) do |(locale, text), acc|
          mapped = present_value(text)
          acc[@locale_mapper.map(locale)] = mapped if mapped
        end
      else
        text = present_value(value)
        text ? { @primary_locale => text } : {}
      end
    end

    # Skips blank scalars and empty collections so the patch stays minimal.
    def put(hash, key, value)
      return if value.nil?
      return if value.respond_to?(:empty?) && value.empty?

      hash[key] = value
    end
  end
end
