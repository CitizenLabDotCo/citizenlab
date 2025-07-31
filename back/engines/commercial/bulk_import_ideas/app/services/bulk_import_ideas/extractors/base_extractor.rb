# frozen_string_literal: true

# TODO: Maybe this in a concern instead
module BulkImportIdeas::Extractors
  class BaseExtractor
    attr_reader :locale

    def initialize(locale)
      @locale = locale || AppConfiguration.instance.settings.dig('core', 'locales').first
    end

    private

    # Return a single locale multiloc - import only supports one locale at the moment
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
  end
end
