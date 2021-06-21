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
      expect(task.inputs_tasks.map(&:input)).to match(inputs)
    end
  end
end
