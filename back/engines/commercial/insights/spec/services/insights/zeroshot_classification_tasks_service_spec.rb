# frozen_string_literal: true

require 'rails_helper'

describe Insights::ZeroshotClassificationTasksService do
  subject(:service) { described_class.new }

  let(:categories) { create_list(:category, 2) }
  let(:inputs) { create_list(:idea, 2) }

  describe '#create_task' do
    it 'creates task correctly' do
      task_id = 'some-task-id'
      task = service.create_task(task_id, inputs, categories)

      aggregate_failures 'check created task' do
        expect(task.task_id).to eq(task_id)
        expect(task.inputs).to match(inputs)
        expect(task.categories).to match(categories)
      end
    end
  end

  describe '#delete_task' do
    let(:task) { create(:zsc_task) }

    it 'deletes the task' do
      service.delete_task(task.task_id)
      expect { task.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
