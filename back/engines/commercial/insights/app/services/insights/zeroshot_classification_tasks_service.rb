# frozen_string_literal: true

module Insights
  class ZeroshotClassificationTasksService
    def create_task(task_id, inputs, categories)
      ZeroshotClassificationTasks.transaction do
        task = ZeroshotClassificationTasks.create(task_id: task_id, categories: categories)
        inputs_tasks_attrs = inputs.map { |i| {input: i} }
        task.inputs_tasks.create(inputs_tasks_attrs)
      end
    end

    def delete_task(task_id)
      ZeroshotClassificationTasks.find_by(task_id: task_id).destroy
    end
  end
end
