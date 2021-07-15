# frozen_string_literal: true

require 'rails_helper'

describe Insights::ZeroshotClassificationTask do
  describe 'factory' do
    specify do
      expect(build(:zsc_task)).to be_valid
    end

    it 'has the right number of categories' do
      task = build(:zsc_task, categories_count: 2)
      expect(task.categories.length).to eq(2)
    end

    it 'has the right number of inputs' do
      task = build(:zsc_task, inputs_count: 3)
      expect(task.inputs.length).to eq(3)
    end

    it "supports the 'inputs' option" do
      inputs = build_list(:idea, 2)
      task = build(:zsc_task, inputs: inputs)
      expect(task.tasks_inputs.map(&:input)).to match(inputs)
    end
  end

  describe '.create_task' do
    let(:categories) { create_list(:category, 2) }
    let(:inputs) { create_list(:idea, 2) }

    it 'creates task correctly' do
      task_id = 'some-task-id'
      task = described_class.create_task(task_id, inputs, categories)

      aggregate_failures 'check created task' do
        expect(task.task_id).to eq(task_id)
        expect(task.inputs).to match(inputs)
        expect(task.categories).to match(categories)
      end
    end
  end
end
