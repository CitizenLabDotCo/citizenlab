# frozen_string_literal: true

module OpinionGroups
  # Turns registration custom fields into categorical demographic features.
  #
  # Only single-select fields and the built-in birthyear field are used. The
  # birthyear is converted to an age band so it becomes categorical too.
  class Demographics
    AGE_BANDS = [
      ['<18', 0, 17],
      ['18-24', 18, 24],
      ['25-34', 25, 34],
      ['35-44', 35, 44],
      ['45-54', 45, 54],
      ['55-64', 55, 64],
      ['65+', 65, 200]
    ].freeze

    Field = Struct.new(:key, :title_multiloc, :categories, keyword_init: true)
    Category = Struct.new(:key, :title_multiloc, keyword_init: true)

    def initialize(locales: AppConfiguration.instance.settings('core', 'locales'))
      @locales = locales
    end

    # @return [Array<Field>]
    def fields
      @fields ||= CustomField.registration.enabled.order(:ordering).filter_map do |custom_field|
        if custom_field.key == 'birthyear'
          Field.new(key: 'birthyear', title_multiloc: custom_field.title_multiloc, categories: age_categories)
        elsif custom_field.input_type == 'select'
          categories = custom_field.ordered_transformed_options.map do |option|
            Category.new(key: option.key, title_multiloc: option.title_multiloc)
          end
          next if categories.size < 2

          Field.new(key: custom_field.key, title_multiloc: custom_field.title_multiloc, categories: categories)
        end
      end
    end

    # @param custom_field_values [Hash] the user's custom_field_values
    # @return [Hash{String => String, nil}] field key => category key
    def categorize(custom_field_values)
      values = custom_field_values || {}
      fields.to_h do |field|
        raw = values[field.key]
        category = if field.key == 'birthyear'
          age_band(raw)
        else
          raw.is_a?(String) && field.categories.any? { |c| c.key == raw } ? raw : nil
        end
        [field.key, category]
      end
    end

    private

    def age_categories
      AGE_BANDS.map do |label, _min, _max|
        Category.new(key: label, title_multiloc: @locales.index_with { label })
      end
    end

    def age_band(birthyear)
      return nil unless birthyear.is_a?(Integer)

      age = Time.zone.now.year - birthyear
      band = AGE_BANDS.find { |_label, min, max| age.between?(min, max) }
      band&.first
    end
  end
end
