# frozen_string_literal: true

# Validates an attribute to be a valid CSS color.
class CssColorValidator < ActiveModel::EachValidator
  # Validates that the attribute is a valid CSS color.
  # Accepted formats:
  # Hex: `#abcdef`, `#FFF`
  # RGB(A): `rgb(255, 255, 255)`, `rgba(255, 255, 255, 0)`
  # HSL: `hsl(180, 50%, 50%)`
  # Keywords: `none`, `transparent`, `inherit`
  def validate_each(record, attribute, value)
    return if record.errors.present? || value.nil?

    validate_css_color(record, attribute, value)
  end

  private

  def validate_css_color(record, attribute, value)
    return if hex_notation?(value) || rgb_notation?(value) || rgba_notation?(value) || hsl_notation?(value) || keyword_notation?(value)

    record.errors.add(attribute, :format)
  end

  def hex_notation?(value)
    /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.match?(value)
  end

  def rgb_notation?(value)
    /^rgb\(\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*,\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*,\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*\)$/.match?(value)
  end

  def rgba_notation?(value)
    /^rgba\(\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*,\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*,\s*(0|[1-9]\d?|1\d\d?|2[0-4]\d|25[0-5])%?\s*,\s*((0.[1-9])|[01])\s*\)$/.match?(value)
  end

  def hsl_notation?(value)
    /^hsl\(\s*(0|[1-9]\d?|[12]\d\d|3[0-5]\d)\s*,\s*((0|[1-9]\d?|100)%)\s*,\s*((0|[1-9]\d?|100)%)\s*\)$/.match?(value)
  end

  def keyword_notation?(value)
    %w[none transparent inherit].include?(value)
  end
end
