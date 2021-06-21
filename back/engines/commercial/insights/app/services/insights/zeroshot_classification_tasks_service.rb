# frozen_string_literal: true

module Insights
  class ZeroshotClassificationTasksService
    def create_task(task_id, inputs, categories)
      ZeroshotClassificationTask.transaction do
        task = ZeroshotClassificationTask.create(task_id: task_id, categories: categories)

        inputs_tasks_attrs = inputs.map { |i| { input: i } }
        task.inputs_tasks.create(inputs_tasks_attrs)

        task
      end
    end

    def delete_task(task_id)
      ZeroshotClassificationTask.find_by(task_id: task_id).destroy
    end
  end
end
