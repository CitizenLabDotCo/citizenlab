# frozen_string_literal: true

# Validates hash attributes that are used to store multilocalized strings, hence the name Multiloc.
class MultilocValidator < ActiveModel::EachValidator
  # Validates an attribute that is used as a multiloc hash.
  # The attribute must be a hash, where keys are a valid locale string (see `CL2_SUPPORTED_LOCALES`) and the values a
  # localized translation string.
  #
  # Example:
  # ```
  # class Page
  #   validates :title, multiloc: true
  # end
  #
  # page = Page.new
  # page.title = { 'en' => 'Summer is great', 'de-DE' => 'Sommer ist großartig' }
  # ```
  #
  # Options:
  # - `html`: [Boolean] If `true`, validates that all values are valid HTML or plain text (default: `false`)
  # - `message`: [String] A custom error message
  # - `presence`: [Boolean] If `true`, validates that all values are present in the hash (default: `false`)
  # - `value_type`: [Class] To overwrite the expected type of the values. (default: `String`)
  def validate_each(record, attribute, value)
    validate_presence record, attribute, value
    return if record.errors.present? || value.nil?

    validate_supported_locales record, attribute, value
    validate_values_types record, attribute, value
    validate_html record, attribute, value
  end

  private

  def validate_presence(record, attribute, value)
    if (options[:presence] && !value.is_a?(Hash)) || (!options[:presence] && !(value.is_a?(Hash) || value.nil?))
      record.errors.add attribute, (options[:message] || 'is not a translation hash')
      return
    end

    sanitizer = SanitizationService.new
    return unless options[:presence] && value.values.all? { |text_or_html| !sanitizer.html_with_content?(text_or_html) }

    message = options[:message] || 'should be set for at least one locale'
    record.errors.add attribute, :blank, message: message
  end

  def validate_values_types(record, attribute, value)
    value_type = options[:value_type] || String
    return if !value&.values || value.values.all?(value_type)

    locales = value.keys.reject { |l| value[l].is_a?(value_type) }
    message = "non-#{value_type} values (for #{locales}) cannot be accepted. Either the key should be removed, or the value should be replaced by an empty #{value_type}"
    record.errors.add attribute, :values_of_wrong_type, message: message
  end

  def validate_supported_locales(record, attribute, value)
    locales = CL2_SUPPORTED_LOCALES.map(&:to_s)
    return if (value.keys - locales).empty?

    message = options[:message] || "contains unsupported locales #{value.keys - locales}"
    record.errors.add attribute, :unsupported_locales, message: message
  end

  def validate_html(record, attribute, value)
    return unless options[:html]

    value.each do |key, html|
      doc = Nokogiri::HTML.fragment html
      plain_text = doc.text == html
      next if plain_text

      doc.errors.each do |error|
        record.errors.add attribute, :bad_html, message: "#{key}: #{error.message}"
      end
    end
  end
end
