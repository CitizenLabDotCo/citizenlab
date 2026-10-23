# frozen_string_literal: true

module Facets
  # Counts the ideas per chosen option of a choice question.
  class IdeaCustomFieldAnswer
    def initialize(field)
      @field = field
    end

    def key = 'custom_field_answers'

    def counts(ideas)
      option_counts = CustomFieldAnswer
        .main_for(@field)
        .where(answerable_id: ideas.select(:id))
        .per_selection
        .group('selections.selection')
        .count

      { @field.id => option_counts }
    end
  end
end
