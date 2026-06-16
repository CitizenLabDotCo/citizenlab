# frozen_string_literal: true

module Export
  module Pdf
    # Flags survey fields that likely hold personal data, so the export UI can
    # pre-select them for redaction. Two signals:
    #   1. Registration/user fields, tagged with a 'u_' key prefix by
    #      UserFieldsInFormService (language-independent).
    #   2. The field title matching a known PII term. The term *categories* live
    #      in code; the term *strings* are translated (pdf_export.pii_terms.*),
    #      so detection works in the tenant's languages via the translation
    #      system rather than hardcoded keyword lists.
    #
    # It's a best-effort safety net; the admin makes the final call in review.
    class PiiDetector
      TERM_KEYS = %w[
        name email phone postal_code postal_address date_of_birth id identification_number
      ].freeze

      def initialize
        @term_regexes = build_term_regexes
      end

      def personal_data?(field)
        return true if field.key.start_with?('u_')

        titles = field.title_multiloc.values.compact
        @term_regexes.any? { |regex| titles.any? { |title| regex.match?(title) } }
      end

      private

      # One regex per translated term, across all of the tenant's locales.
      def build_term_regexes
        locales = AppConfiguration.instance.settings('core', 'locales')
        terms = locales.flat_map do |locale|
          I18n.with_locale(locale) do
            TERM_KEYS.map { |key| I18n.t("pdf_export.pii_terms.#{key}") }
          end
        end
        terms.uniq.map { |term| /\b#{Regexp.escape(term)}\b/i }
      end
    end
  end
end
