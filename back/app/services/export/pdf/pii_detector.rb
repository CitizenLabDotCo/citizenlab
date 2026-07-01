# frozen_string_literal: true

module Export
  module Pdf
    # Flags input fields that likely hold personal data, so the export UI can
    # pre-select them for redaction. Two signals:
    #   1. Registration/user fields — either the out-of-form ones (resource_type
    #      'User') or the in-form ones tagged with a 'u_' key prefix by
    #      UserFieldsInFormService (both language-independent).
    #   2. The field title matching a known PII term. Hardcoded English terms for
    #      now (this detection is slated to be reworked), so matching only works
    #      for English-language titles.
    #
    # It's a best-effort safety net; the admin makes the final call in review.
    class PiiDetector
      TERMS = [
        'name', 'email', 'phone number', 'postal code', 'postal address',
        'date of birth', 'ID', 'identification number'
      ].freeze

      def initialize
        @term_regexes = TERMS.map { |term| /\b#{Regexp.escape(term)}\b/i }
      end

      def personal_data?(field)
        return true if field.resource_type == 'User' || field.key.start_with?('u_')

        titles = field.title_multiloc.values.compact
        @term_regexes.any? { |regex| titles.any? { |title| regex.match?(title) } }
      end
    end
  end
end
