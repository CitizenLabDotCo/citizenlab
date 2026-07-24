# frozen_string_literal: true

module DecidimImporter
  # Deterministic Go Vocal `CustomField` keys derived from Decidim question/option/matrix-row
  # references, shared by {Extractors::SurveysExtractor} (which builds the form) and
  # {Extractors::SurveyResponsesExtractor} (which builds `custom_field_values` for each response).
  # Both must agree on the key for a given reference, so the response can address the field/option the
  # form created — without threading the form records between the two passes.
  #
  # Decidim references come in two shapes across export versions: a bare numeric id (older exports) and
  # a `decidim--forms--question--46` UID (newer exports). Both reduce to the same trailing number, so
  # `question--46` and `46` both key to `field_46`. The result is always `/\A[a-zA-Z0-9_]+\z/`, which
  # the `CustomField` key format requires (the raw UID's dashes would be rejected).
  module SurveyKeys
    module_function

    def field_key(reference)
      "field_#{numeric_suffix(reference)}"
    end

    def option_key(reference)
      "option_#{numeric_suffix(reference)}"
    end

    def statement_key(reference)
      "statement_#{numeric_suffix(reference)}"
    end

    # The trailing number of a reference: `decidim--forms--question--46` → `46`, `46` → `46`.
    def numeric_suffix(reference)
      reference.to_s.split('--').last
    end
  end
end
