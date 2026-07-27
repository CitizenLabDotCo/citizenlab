# frozen_string_literal: true

module DecidimImporter
  # Parsing helpers for the non-extractor mappers (app config, custom fields), mirroring
  # {BaseExtractor}'s own copies for code that doesn't subclass it. Mixed in or called on the module.
  module Parsing
    module_function

    # Cell values treated as boolean true, including the checkbox-style `x`/`checked` some Decidim
    # exports use.
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
