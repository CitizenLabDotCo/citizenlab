# frozen_string_literal: true

require 'rails_helper'

describe Insights::ZeroshotClassificationTasksFinder do
  describe '#execute' do

    context 'when inputs is empty (not nil)' do
      let(:task) { create(:zsc_task) }

      it 'returns no tasks' do
        finder = described_class.new(task.categories, inputs: [])
        expect(finder.execute).to be_empty
      end
    end
  end
end
