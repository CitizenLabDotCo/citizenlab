# frozen_string_literal: true

module Insights
  class CategoryAssignment < ::ApplicationRecord
    belongs_to :category
    belongs_to :input, polymorphic: true

    validates :category, presence: true
    validates :input, presence: true
    validates :input_id, uniqueness: { scope: %i[input_type category], message: 'Assignment already exists'}
  end
end
