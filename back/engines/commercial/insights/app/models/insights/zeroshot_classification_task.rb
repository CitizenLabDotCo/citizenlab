# frozen_string_literal: true

# == Schema Information
#
# Table name: insights_zeroshot_classification_tasks
#
#  id         :uuid             not null, primary key
#  task_id    :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_insights_zeroshot_classification_tasks_on_task_id  (task_id) UNIQUE
#
module Insights
  # Prefer using +.create_task+ instead of the regular +.create+.
  # It will take care of creating +Insights::ZeroshotClassificationTaskInput+
  # records from inputs directly.
  class ZeroshotClassificationTask < ::ApplicationRecord
    has_and_belongs_to_many :categories, join_table: 'insights_zeroshot_classification_tasks_categories', foreign_key: :task_id
    has_many :tasks_inputs,
             class_name: 'Insights::ZeroshotClassificationTaskInput',
             foreign_key: :task_id, dependent: :destroy

    validates :task_id, presence: true, uniqueness: true

    # @param [String] task_id
    # @param [Insights::Category] categories
    # @return [ZeroshotClassificationTask]
    def self.create_task(task_id, inputs, categories)
      ZeroshotClassificationTask.transaction do
        task = ZeroshotClassificationTask.create(task_id: task_id, categories: categories)
        task.add_inputs(inputs)

        task
      end
    end

    def inputs
      tasks_inputs.map(&:input)
    end

    def add_inputs(inputs)
      tasks_inputs_attrs = inputs.map { |i| { input: i } }
      tasks_inputs.create(tasks_inputs_attrs)

      self
    end

    def add_input(input)
      add_inputs([input])
    end
  end
end
