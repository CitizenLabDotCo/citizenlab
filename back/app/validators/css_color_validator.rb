# frozen_string_literal: true

# @see CssColorValidator#validate_each
class CssColorValidator < ActiveModel::EachValidator
  HEX_PATTERN = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.freeze
  HSL_PATTERN = /^hsl\(\s*(0|[1-9]\d?|[12]\d\d|3[0-5]\d)\s*,\s*((0|[1-9]\d?|100)%)\s*,\s*((0|[1-9]\d?|100)%)\s*\)$/.freeze
  KEYWORDS = %w[none transparent inherit].freeze
  RGBA_PATTERN = /^rgba\(\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*,\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*,\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*,\s*((0.[1-9])|[01])\s*\)$/.freeze
  RGB_PATTERN = /^rgb\(\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*,\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*,\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*\)$/.freeze

  # Validates that the attribute is a valid CSS color, same as the validation we have in `style.schema.json`.
  # Accepted formats:
  # Hex: `#abcdef`, `#FFF`
  # RGB(A): `rgb(255, 255, 255)`, `rgba(255, 255, 255, 0)`
  # HSL: `hsl(180, 50%, 50%)`
  # Keywords: `none`, `transparent`, `inherit`
  # @note Does not accept color names (such as `brown`, `yellow`) yet
  def validate_each(record, attribute, value)
    return if value.nil?

    validate_css_color(record, attribute, value)
  end

  private

  def validate_css_color(record, attribute, value)
    return if [hex_notation?(value),
      rgb_notation?(value),
      rgba_notation?(value),
      hsl_notation?(value),
      keyword_notation?(value)].any?

    record.errors.add(attribute, :format)
  end

  def hex_notation?(value)
    HEX_PATTERN.match?(value)
  end

  def rgb_notation?(value)
    RGB_PATTERN.match?(value)
  end

  def rgba_notation?(value)
    RGBA_PATTERN.match?(value)
  end

  def hsl_notation?(value)
    HSL_PATTERN.match?(value)
  end

  def keyword_notation?(value)
    KEYWORDS.include?(value)
  end
end
