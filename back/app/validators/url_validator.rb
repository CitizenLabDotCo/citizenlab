# frozen_string_literal: true

# @see UrlValidator#validate_each
class UrlValidator < ActiveModel::EachValidator
  # Anchored to the whole string (`\A`/`\z`, not `^`, which matches after any
  # line break), and no whitespace or control characters anywhere: browsers strip
  # those from URLs, so `"javascript:alert(1)//\nhttps://x"` would otherwise pass.
  URL_PATTERN = %r{\Ahttps?://[^[:space:][:cntrl:]]+\z}

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
