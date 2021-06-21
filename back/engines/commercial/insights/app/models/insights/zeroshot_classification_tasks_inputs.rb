# frozen_string_literal: true

module Insights
  class ZeroshotClassificationTasksInputs < ::ApplicationRecord
    belongs_to :input, polymorphic: true
    belongs_to :task, class_name: 'Insights::ZeroshotClassificationTask'

    validates :input, presence: true
    validates :task, presence: true
    validates :input_id, uniqueness: { scope: [:task] }
  end
end
