# frozen_string_literal: true

# @see UrlValidator#validate_each
class UrlValidator < ActiveModel::EachValidator
  URL_PATTERN = %r{^(http(s)?://.+)}.freeze

  # Validates that the attribute is a valid URL. Allowed are URLs starting with `https://` or `http://`.
  def validate_each(record, attribute, value)
    return if value.nil?

    validate_url(record, attribute, value)
  end

  private

  def validate_url(record, attribute, value)
    record.errors.add(attribute, :url, 'is not a valid URL') unless URL_PATTERN.match?(value)
  end
end
