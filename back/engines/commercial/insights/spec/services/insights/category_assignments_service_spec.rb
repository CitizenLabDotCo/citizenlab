# frozen_string_literal: true

require 'rails_helper'

describe Insights::CategoryAssignmentsService do
  subject(:service) { described_class.new }

  describe '#add_assignments!' do
    it 'raises an error for invalid input types' do
      input = create(:comment) # a comment is not valid input type
      expect { service.add_assignments(input, []) }.to raise_error(ArgumentError)
    end

    it 'assigns categories to the input' do
      input = create(:idea)
      categories = create_list(:category, 2) # doesn't need to belong to the same view
      assignments = service.add_assignments(input, categories)

      aggregate_failures 'check assignments' do
        expect(input.insights_category_assignments).to match(assignments)
        expect(assignments.count).to eq(2)
        expect(assignments.map(&:approved).all?).to be(true)
      end
    end

    it 'works even if some assignments already exist' do
      input = create(:idea)
      categories = create_list(:category, 3) 
      service.add_assignments(input, categories[0..1])

      aggregate_failures 'check assignments' do
        assignments = nil # nasty trick to extract the value from the expect block
        expect { assignments = service.add_assignments(input, categories[1..2]) }
          .to(change { input.insights_category_assignments.count }.from(2).to(3))

        expect(assignments.count).to eq(2)
        expect(assignments.map(&:approved).all?).to be(true)
      end
    end
  end

  describe '#add_suggestions' do
    it 'raises an error for invalid input types' do
      input = create(:comment) # a comment is not valid input type
      expect { service.add_suggestions(input, []) }.to raise_error(ArgumentError)
    end

    it 'assigns categories to the input' do
      input = create(:idea)
      categories = create_list(:category, 2) 
      assignments = service.add_suggestions(input, categories)

      aggregate_failures 'check assignments' do
        expect(input.insights_category_assignments).to match(assignments)
        expect(assignments.count).to eq(2)
        expect(assignments.map(&:approved).all?).to be(false)
      end
    end

    # rubocop:disable RSpec/ExampleLength
    it "doesn't override (approved) category assignments" do
      input = create(:idea)
      categories = create_list(:category, 2) 
      approved_assignment = service.add_assignments(input, [categories.first]).first

      aggregate_failures 'check assignments' do
        assignments = nil # nasty trick to extract the value from the expect block
        expect { assignments = service.add_suggestions(input, categories) }
          .to(change { input.insights_category_assignments.count }.from(1).to(2))

        expect(assignments.count).to eq(1)
        expect(assignments.first.approved).to be(false)
        expect(approved_assignment.reload.approved).to be(true) # didn't override the approval status
      end
    end
    # rubocop:enable RSpec/ExampleLength
  end
end
