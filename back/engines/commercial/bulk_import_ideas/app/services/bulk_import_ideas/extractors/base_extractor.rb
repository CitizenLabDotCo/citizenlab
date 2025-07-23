# frozen_string_literal: true

# TODO: Maybe this in a concern instead
module BulkImportIdeas::Extractors
  class BaseExtractor
    private

    def multiloc(str)
      locales.index_with { |_locale| str } # Same text assigned to all locales
    end

    def generate_key(str)
      str.parameterize.tr('-', '_')
    end

    def remove_empty_array_values(array_values)
      array_values.compact.reject { |value| value.is_a?(String) && value.empty? }
    end

    def locales
      @locales ||= AppConfiguration.instance.settings.dig('core', 'locales')
    end
  end
end
