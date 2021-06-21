# frozen_string_literal: true

FactoryBot.define do
  factory :zsc_task, class: 'Insights::ZeroshotClassificationTask' do
    sequence(:task_id)

    transient do
      categories_count { 1 }
      inputs { nil }
      inputs_count { 1 }
    end

    inputs_tasks do
      if inputs
        inputs.map { |i| association(:zsc_tasks_inputs, task: instance, input: i) }
      else
        Array.new(inputs_count) { association(:zsc_tasks_inputs, task: instance) }
      end
    end

    categories do
      Array.new(categories_count) { association(:category) }
    end
  end

  factory :zsc_tasks_inputs, class: 'Insights::ZeroshotClassificationTasksInputs' do
    input factory: :idea
    task factory: :zsc_task
  end
end
