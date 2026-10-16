# frozen_string_literal: true

module Facets
  # Counts the ideas per chosen option of a choice question.
  class IdeaCustomFieldAnswer
    OPTION_KEYS = <<~SQL.squish
      SELECT answerable_id, key,
        jsonb_array_elements_text(
          CASE WHEN jsonb_typeof(value) = 'array' THEN value ELSE jsonb_build_array(value) END
        ) AS option_key
      FROM custom_field_answers
      WHERE answerable_type = 'Idea'
    SQL

    def initialize(field)
      @field = field
    end

    def key = 'custom_field_answers'

    def counts(ideas)
      option_counts = CustomFieldAnswer
        .from("(#{OPTION_KEYS}) AS custom_field_answers")
        .where(key: @field.key, answerable_id: ideas.select(:id))
        .group(:option_key)
        .count

      { @field.id => option_counts }
    end
  end
end
