# frozen_string_literal: true

class MultilocValidator < ActiveModel::EachValidator
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
      record.errors[attribute] << (options[:message] || 'is not a translation hash')
      return
    end

    sanitizer = SanitizationService.new
    if options[:presence] && value.values.all? { |text_or_html| !sanitizer.html_with_content?(text_or_html) }
      message = options[:message] || 'should be set for at least one locale'
      record.errors.add attribute, :blank, message: message
    end
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
    unless (value.keys - locales).empty?
      message = options[:message] || "contains unsupported locales #{value.keys - locales}"
      record.errors.add attribute, :unsupported_locales, message: message
    end
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
