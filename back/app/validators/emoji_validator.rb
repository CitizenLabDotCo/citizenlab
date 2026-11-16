# frozen_string_literal: true

# Validates that the attribute holds exactly one emoji: a single extended grapheme cluster that
# starts as an emoji does. That covers plain emoji, skin-tone and ZWJ sequences (`👩‍👩‍👧‍👦`), flags
# (`🇧🇪`) and keycaps (`1️⃣`), and rejects everything else, including any markup.
#
# Values are rendered as HTML by the front end (twemoji output goes into `innerHTML`), so this is
# a security boundary, not just a format check.
#
#     validates :icon, emoji: true, allow_blank: true
class EmojiValidator < ActiveModel::EachValidator
  PATTERN = /\A(?=\X\z)(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[0-9#*]️?⃣)/

  def self.emoji?(value)
    value.is_a?(String) && PATTERN.match?(value)
  end

  def validate_each(record, attribute, value)
    record.errors.add(attribute, :invalid) unless self.class.emoji?(value)
  end
end
