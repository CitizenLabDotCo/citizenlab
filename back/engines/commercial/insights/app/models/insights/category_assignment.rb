# frozen_string_literal: true

# == Schema Information
#
# Table name: insights_category_assignments
#
#  id          :uuid             not null, primary key
#  category_id :uuid             not null
#  input_type  :string           not null
#  input_id    :uuid             not null
#  approved    :boolean          default(TRUE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_insights_category_assignments_on_approved                 (approved)
#  index_insights_category_assignments_on_category_id              (category_id)
#  index_insights_category_assignments_on_input_type_and_input_id  (input_type,input_id)
#  index_single_category_assignment                                (category_id,input_id,input_type) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (category_id => insights_categories.id)
#
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



    def touch_view
      category.view.touch if previous_changes.present?
    end

    def approved?
      approved
    end
  end
end
