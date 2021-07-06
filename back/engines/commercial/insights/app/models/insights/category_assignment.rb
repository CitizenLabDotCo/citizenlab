# frozen_string_literal: true

module Insights
  class CategoryAssignment < ::ApplicationRecord
    INPUT_TYPES = ['Idea'].freeze

    belongs_to :category
    counter_culture :category, column_name: 'inputs_count'
    belongs_to :input, polymorphic: true

    delegate :view, to: :category

    # When modifying validators & callbacks here, make sure to update the batch
    # insert/update in Insights::CategoryAssignmentsService accordingly, as
    # they bypass the callbacks (including the validation).
    validates :input_type, inclusion: { in: INPUT_TYPES }
    validates :category, presence: true
    validates :input, presence: true
    validates :input_id, uniqueness: { scope: %i[input_type category], message: 'Assignment already exists' }

    # Updates 'updated_at' of the view when actions are taken within the view.
    after_destroy :touch_view
    after_save :touch_view

    def touch_view
      category.view.touch if previous_changes.present?
    end

    def approved?
      approved
    end
  end
end
