# frozen_string_literal: true

require 'rails_helper'

describe Insights::ZeroshotClassificationTasksFinder do
  describe '#execute' do

    before_all do
      view = create(:view)
      @c1, @c2 = create_list(:category, 2, view: view)

      @c1_tasks = create_list(:zsc_task, 1, categories: [@c1], inputs_count: 2)
      @c2_tasks = create_list(:zsc_task, 2, categories: [@c2])
      @c1c2_tasks = [create(:zsc_task, categories: [@c1, @c2])]
      create(:zsc_task) # some unrelated task
    end

    it 'returns tasks for a single category' do
      finder = described_class.new([@c1])
      expect(finder.execute).to match_array(@c1_tasks + @c1c2_tasks)
    end

    it 'returns tasks for multiple categories' do
      finder = described_class.new([@c1, @c2])
      expect(finder.execute).to match_array(@c1_tasks + @c1c2_tasks + @c2_tasks)
    end

    it 'returns nothing if inputs is empty' do
      finder = described_class.new([@c1, @c2], inputs: [])
      expect(finder.execute.count).to eq(0)
    end

    it 'returns tasks associated to inputs' do
      task = @c1_tasks.first
      finder = described_class.new([@c1, @c2], inputs: task.inputs)
      expect(finder.execute).to eq([task])
    end

    it 'returns tasks associated to inputs (across multiple categories)' do
      inputs = @c2_tasks.flat_map(&:inputs)
      finder = described_class.new([@c1, @c2], inputs: inputs)
      expect(finder.execute).to match_array(@c2_tasks)
    end

    it 'returns nothing if there is no task with the right category-input combination' do
      inputs = @c1_tasks.first.inputs
      finder = described_class.new([@c2], inputs: inputs)
      expect(finder.execute.count).to eq(0)
    end
  end
end
