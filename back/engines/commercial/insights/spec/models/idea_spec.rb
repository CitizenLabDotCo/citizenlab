# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Idea, type: :model do
  describe 'callbacks' do
    context 'when destroyed' do
      subject(:idea) { create(:idea) }

      it 'deletes associated Insights::ZeroshotClassificationTasksInputs' do
        task = create(:zsc_task, inputs: [idea])
        task_input = task.inputs_tasks.first

        aggregate_failures 'check deletion' do
          expect { idea.destroy! }.to change { task.reload.inputs_tasks.count }.by(-1)
          expect { task_input.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end
  end
end
