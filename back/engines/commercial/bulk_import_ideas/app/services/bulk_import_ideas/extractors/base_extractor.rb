# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class BaseExtractor
    attr_reader :locale

    def initialize(locale)
      @locale = locale || AppConfiguration.instance.settings.dig('core', 'locales').first
    end

    private

    # Generally these are just helper methods that can be used by any of the extractors

    # Return a single locale multiloc - imports only support one locale at the moment
    def multiloc(str)
      return {} if str.blank?

      { locale => str }
    end

    def generate_key(str)
      str.parameterize.tr('-', '_')
    end

    def remove_empty_array_values(array_values)
      array_values.compact.reject { |value| value.is_a?(String) && value.empty? }
    end

    # Rogue spaces can cause issues, so we clean them up
    def clean_string_value(value)
      return value unless value.is_a?(String)

      value = value.gsub(/\s+,\s+/, ', ') # Clean up spaces around commas
      value = value.gsub(/\s+:\s+/, ': ') # Clean up spaces around colons
      value.gsub(/\s+/, ' ').strip
    end

    def ensure_string_values(rows, column_name)
      rows.map do |row|
        row[column_name] = row[column_name].to_s if row[column_name] # Ensure the value is a string
        row
      end
    end

    # Update values to ensure semicolons as delimiters for multiselect & matrix fields - to match our standard
    # Updates the full string and not just the delimiter so that it can handle options like "Run, or jog" correctly.
    def standardise_delimiters(rows, column_name, values, original_delimiter)
      rows.map do |row|
        if row[column_name]
          values.each do |value|
            row[column_name] = row[column_name].gsub("#{value}#{original_delimiter} ", "#{value}; ")
          end
        end
        row
      end
    end
  end
end
