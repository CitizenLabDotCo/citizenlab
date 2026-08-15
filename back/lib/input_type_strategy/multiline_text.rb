# frozen_string_literal: true

module InputTypeStrategy
  # Multiline text answers are stored exactly like single-line text answers, so the text answer
  # conditions (`answers_eq`, `answers_matching`) apply as well. Smart group `custom_field_text`
  # rules on multiline text registration fields exist in production and depend on this (TAN-8516).
  class MultilineText < Text
  end
end
