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

    def initialize(mapping = {}, fallback_locale: 'fr-FR')
      @mapping = DEFAULT_MAPPING.merge(mapping)
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
