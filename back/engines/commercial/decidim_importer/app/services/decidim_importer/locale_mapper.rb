# frozen_string_literal: true

module DecidimImporter
  # Maps Decidim locale codes (often 2-char, e.g. "fr") onto Go Vocal's supported codes
  # (often 4-char, e.g. "fr-FR"). Early migrations are French-only, but the platform must be ready
  # for two- to four-character expansion, so this is configurable.
  class LocaleMapper
    DEFAULT_MAPPING = {
      'fr' => 'fr-FR',
      'nl' => 'nl-BE',
      'en' => 'en',
      'de' => 'de-DE',
      'es' => 'es-ES'
    }.freeze

    # @param mapping [Hash] explicit Decidim-code → Go Vocal-code overrides (highest precedence).
    # @param fallback_locale [String] the Go Vocal locale for the source platform's primary language;
    #   used for blank/unknown codes *and* to override the default region for that language. E.g.
    #   `fallback_locale: 'fr-BE'` maps Decidim `fr` → `fr-BE` instead of the default `fr-FR`, so a
    #   French export lands in the target's French variant.
    def initialize(mapping = {}, fallback_locale: 'fr-FR')
      base_language = fallback_locale.to_s.split('-').first
      @mapping = DEFAULT_MAPPING.merge(base_language => fallback_locale).merge(mapping)
      @fallback_locale = fallback_locale
    end

    # @param code [String, Symbol, nil]
    # @return [String] a Go Vocal locale code.
    def map(code)
      code = code.to_s.strip
      return @fallback_locale if code.empty?
      return @mapping[code] if @mapping.key?(code)
      # Already a regioned code (e.g. "pt-BR") we don't have an override for: keep as-is.
      return code if code.include?('-')

      @fallback_locale
    end

    attr_reader :fallback_locale
  end
end
