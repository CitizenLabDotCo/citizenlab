# frozen_string_literal: true

module DecidimImporter
  # Small parsing helpers shared by the non-extractor mappers (organization → app config,
  # extra-user-fields → custom fields). The extractors keep their own copies on {BaseExtractor};
  # these mirror that behaviour for code that doesn't subclass it. Mixed in as private instance
  # methods or called on the module directly.
  module Parsing
    module_function

    # Cell values treated as boolean true — includes the checkbox-style `x`/`checked` some Decidim
    # exports use, so extractors and the non-extractor mappers agree on truthiness.
    TRUE_VALUES = %w[1 true t yes y x checked].freeze

    # Parses a JSON object/array cell, returning the Ruby value or nil for blanks / non-JSON.
    def parse_json(value)
      return value if value.is_a?(Hash) || value.is_a?(Array)

      str = value.to_s.strip
      return nil unless str.start_with?('{', '[')

      JSON.parse(str)
    rescue JSON::ParserError
      nil
    end

    def present_value(value)
      str = value.to_s.strip
      str.empty? ? nil : str
    end

    def truthy?(value)
      TRUE_VALUES.include?(value.to_s.strip.downcase)
    end
  end
end
