# frozen_string_literal: true

module Insights
  class CategoryAssignment < ::ApplicationRecord
    belongs_to :category
    belongs_to :input, polymorphic: true

    validates :input_type, inclusion: { in: ['Idea'] }
    validates :category, presence: true
    validates :input, presence: true
    validates :input_id, uniqueness: { scope: %i[input_type category], message: 'Assignment already exists'}

    # Updates 'updated_at' of the view when actions are taken within the view.
    after_destroy :touch_view
    after_save :touch_view

    def touch_view
      category.view.touch if previous_changes.present?
    end
  end
end
