# frozen_string_literal: true

# == Schema Information
#
# Table name: insights_zeroshot_classification_tasks_inputs
#
#  id         :uuid             not null, primary key
#  task_id    :uuid             not null
#  input_type :string           not null
#  input_id   :uuid             not null
#
# Indexes
#
#  index_insights_zeroshot_classification_tasks_inputs_on_task_id  (task_id)
#  index_insights_zsc_tasks_inputs_on_input                        (input_type,input_id)
#  index_insights_zsc_tasks_inputs_on_input_and_task_id            (input_id,input_type,task_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (task_id => insights_zeroshot_classification_tasks.id)
#
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
