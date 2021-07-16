# frozen_string_literal: true

module Insights
  class ZeroshotClassificationTaskInput < ::ApplicationRecord
    self.table_name = 'insights_zeroshot_classification_tasks_inputs'

    belongs_to :input, polymorphic: true
    belongs_to :task, class_name: 'Insights::ZeroshotClassificationTask'

    validates :input, presence: true
    validates :task, presence: true
    validates :input_id, uniqueness: { scope: [:task] }
  end
end
