# frozen_string_literal: true

module Insights
  class ZeroshotClassificationTasksService
    def create_task(task_id, inputs, categories)
      ZeroshotClassificationTasks.transaction do
        task = ZeroshotClassificationTasks.create(task_id: task_id, categories: categories)
        task.inputs_tasks.create(inputs: inputs)
      end
    end

    def delete_task(task_id)
      ZeroshotClassificationTasks.find_by(task_id: task_id).destroy
    end
  end
end
