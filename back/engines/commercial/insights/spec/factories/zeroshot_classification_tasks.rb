# frozen_string_literal: true

FactoryBot.define do
  factory :zsc_task, class: 'Insights::ZeroshotClassificationTask' do
    sequence(:task_id)

    transient do
      categories_count { 1 }
      inputs { nil }
      inputs_count { 1 }
    end

    # Watch-out: there is some inter-dependency between tasks_inputs and categories
    # attributes to make sure the created tasks are coherent (inputs belong to the 
    # scope of the view associated with the categories). Be careful to maintain that
    # coherence when editing this code.
    tasks_inputs do
      inputs_ = inputs || Array.new(inputs_count) do
        association(:idea, project: categories.first.view.scope)
      end

      inputs_.map { |i| association(:zsc_task_input, task: instance, input: i) }
    end

    categories do
      view = inputs ? association(:view, scope: inputs.first.project) : association(:view)
      Array.new(categories_count) { association(:category, view: view) }
    end
  end

  factory :zsc_task_input, class: 'Insights::ZeroshotClassificationTaskInput' do
    input factory: :idea
    task factory: :zsc_task
  end
end
