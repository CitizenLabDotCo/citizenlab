# frozen_string_literal: true

FactoryBot.define do
  factory :zsc_task, class: 'Insights::ZeroshotClassificationTask' do
    sequence(:task_id)

    transient do
      categories_count { 1 }
      inputs { nil }
      inputs_count { 1 }
    end

    tasks_inputs do
      if inputs
        inputs.map { |i| association(:zsc_task_input, task: instance, input: i) }
      else
        Array.new(inputs_count) { association(:zsc_task_input, task: instance) }
      end
    end

    categories do
      Array.new(categories_count) { association(:category) }
    end
  end

  factory :zsc_task_input, class: 'Insights::ZeroshotClassificationTaskInput' do
    input factory: :idea
    task factory: :zsc_task
  end
end
