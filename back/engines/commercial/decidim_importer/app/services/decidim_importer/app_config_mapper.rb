# frozen_string_literal: true

module DecidimImporter
  # Builds the small **AppConfiguration patch** the import applies — just the locale set (from the Decidim
  # `01--organization.csv` row) plus the feature flags the import relies on. Emitted as a separate artifact
  # (`<export>.app_config.json`) because the tenant-template deserializer ignores app configuration;
  # {Importer.apply_import_app_config_file} unions the locales in and turns the flags on. Everything else
  # in Decidim's organization row (name, branding, timezone, SMTP, social handles, …) is deliberately not
  # mapped — the target tenant keeps its own.
  class AppConfigMapper
    include Parsing

    def initialize(org_row, locale_mapper:, primary_locale:)
      @row = org_row || {}
      @locale_mapper = locale_mapper
      @primary_locale = primary_locale
    end

    # @return [Hash] e.g.
    #   { 'settings' => { 'core' => { 'locales' => ['fr-FR', 'en'] },
    #                     'project_static_pages' => { 'allowed' => true, 'enabled' => true },
    #                     'parallel_participation' => { 'allowed' => true, 'enabled' => true } } }
    def patch
      settings = feature_settings
      locales = mapped_locales
      settings['core'] = { 'locales' => locales } if locales.any?
      { 'settings' => settings }
    end

    private

    # Feature flags the import always turns on (each allowed *and* enabled). `project_static_pages` backs
    # the project-level static pages the importer creates from Decidim `pages` components;
    # `parallel_participation` puts imported projects into the redesigned, content-builder-driven back
    # office the import targets.
    def feature_settings
      {
        'project_static_pages' => { 'allowed' => true, 'enabled' => true },
        'parallel_participation' => { 'allowed' => true, 'enabled' => true }
      }
    end

    # Decidim `default_locale` first, then `available_locales`, each mapped to a Go Vocal code and
    # filtered to supported ones — an unsupported locale would fail AppConfiguration validation on merge.
    def mapped_locales
      available = parse_json(@row['available_locales'])
      list = available.is_a?(Array) ? available : []
      ordered = ([present_value(@row['default_locale'])] + list).compact
      supported = CL2_SUPPORTED_LOCALES.map(&:to_s)
      ordered.map { |code| @locale_mapper.map(code) }.uniq.select { |locale| supported.include?(locale) }
    end
  end
end
