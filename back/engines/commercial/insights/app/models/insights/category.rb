# frozen_string_literal: true

module Insights
  class Category < ::ApplicationRecord
    belongs_to :view, touch: true
    has_many :assignments, class_name: 'Insights::CategoryAssignment', dependent: :destroy
    has_and_belongs_to_many :tasks,
                            class_name: 'Insights::ZeroshotClassificationTask',
                            join_table: 'insights_zeroshot_classification_tasks_categories'

    acts_as_list scope: :view

    validates :name, presence: true, uniqueness: { scope: :view }
    validates :view, presence: true
  end
end
