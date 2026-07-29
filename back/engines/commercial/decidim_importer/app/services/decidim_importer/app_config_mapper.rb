# frozen_string_literal: true

module DecidimImporter
  # Maps a Decidim `01--organization.csv` row onto a Go Vocal **AppConfiguration patch** — a JSON-able
  # hash of only the fields with a Go Vocal equivalent.
  #
  # The tenant-template deserializer ignores app configuration, so this is emitted as a separate
  # artifact (`<export>.app_config.json`) that an operator merges into the target tenant's
  # AppConfiguration on import. Only mapped, non-empty keys are included; Decidim fields with no Go
  # Vocal counterpart (social handles, CSP, file-upload limits, …) are omitted rather than guessed at.
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
      settings = feature_settings
      core = core_settings
      settings['core'] = core if core.any?
      result['settings'] = settings if settings.any?

      logo = present_value(@row['logo'])
      favicon = present_value(@row['favicon'])
      # Image uploaders fetch from `remote_<field>_url` on assignment. The Decidim dev export points
      # these at `http://localhost/…`, unreachable from Go Vocal infra — the operator keeps or drops.
      result['remote_logo_url'] = logo if logo
      result['remote_favicon_url'] = favicon if favicon

      result
    end

    private

    # Feature flags the import always turns on. The importer creates project-level static pages from
    # Decidim `pages` components, so `project_static_pages` must be allowed *and* enabled to use them.
    def feature_settings
      {
        'project_static_pages' => { 'allowed' => true, 'enabled' => true }
      }
    end

    def core_settings
      core = {}
      put(core, 'organization_name', multiloc(@row['name']))
      put(core, 'meta_description', multiloc(@row['description']))
      put(core, 'locales', mapped_locales)
      put(core, 'timezone', mapped_timezone)
      put(core, 'organization_site', present_value(@row['official_url']))
      put(core, 'reply_to_email', smtp_reply_to_email)
      core
    end

    # Decidim stores friendly time-zone names ("Paris", "UTC"); Go Vocal wants an IANA id
    # ("Europe/Paris"). Map via ActiveSupport, fall back to the raw value, and emit only if supported —
    # a bad timezone would fail AppConfiguration validation on merge.
    def mapped_timezone
      raw = present_value(@row['time_zone'])
      return nil if raw.nil?

      candidates = [ActiveSupport::TimeZone[raw]&.tzinfo&.name, raw].compact
      candidates.find { |tz| TimezoneService::SUPPORTED_TIMEZONES.include?(tz) }
    end

    # Decidim `default_locale` first, then `available_locales`, each mapped to a Go Vocal code and
    # filtered to supported ones — an unsupported locale would fail AppConfiguration validation on
    # merge (same guard as {#mapped_timezone}).
    def mapped_locales
      available = parse_json(@row['available_locales'])
      list = available.is_a?(Array) ? available : []
      ordered = ([present_value(@row['default_locale'])] + list).compact
      supported = CL2_SUPPORTED_LOCALES.map(&:to_s)
      ordered.map { |code| @locale_mapper.map(code) }.uniq.select { |locale| supported.include?(locale) }
    end

    # Decidim's SMTP `from_email` becomes Go Vocal's *reply-to* (not `from_email`): the `from_email`
    # only works once the customer has made DNS changes, whereas reply-to routes replies to the org
    # safely without that setup.
    def smtp_reply_to_email
      smtp = parse_json(@row['smtp_settings'])
      smtp.is_a?(Hash) ? present_value(smtp['from_email']) : nil
    end

    # Decidim multilocs are a `{"fr":"…","en":"…"}` JSON object, or plain text on single-locale
    # platforms; locale codes are mapped to Go Vocal codes.
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
