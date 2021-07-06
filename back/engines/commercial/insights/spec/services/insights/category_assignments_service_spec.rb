# frozen_string_literal: true

require 'rails_helper'

describe Insights::CategoryAssignmentsService do
  subject(:service) { described_class.new }

  describe '#add_assignments' do
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

    it 'updates the input count on category' do
      input = create(:idea)
      categories = create_list(:category, 3)

      aggregate_failures 'check categories input_count' do
        service.add_assignments(input, categories[1..2])

        expect(categories.map(&:inputs_count)).to eq([0, 1, 1])
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

  describe '#add_assignments_batch' do
    let(:inputs) { create_list(:idea, 2) }
    let(:view) { create(:view) }
    let(:view_id) { view.id }
    let(:categories) { create_list(:category, 3, view: view) }

    it 'creates assignments' do
      assignment_ids = service.add_assignments_batch(inputs, categories)
      assignments = Insights::CategoryAssignment.find(assignment_ids)

      aggregate_failures 'checking assignments' do
        expect(assignment_ids.length).to eq(6)
        expect(assignments.map(&:approved?).all?).to be(true)
        expect(assignments.pluck(:input_id).uniq).to match(inputs.pluck(:id))
        expect(assignments.pluck(:category_id).uniq).to match(categories.pluck(:id))
      end
    end

    it 'raises an error for inputs with bad type' do
      expect { service.add_assignments_batch([create(:comment)], categories) }
        .to raise_error(ArgumentError)
    end

    it 'overrides (timestamps) of existing assignments' do
      old_assignment = Insights::CategoryAssignment.create(input: inputs.first, category: categories.first)

      new_assignment_ids = nil
      expect { new_assignment_ids = service.add_assignments_batch(inputs, categories) }.to(
        change { old_assignment .reload.created_at }.and(change { old_assignment .reload.updated_at })
      )
      expect(new_assignment_ids.length).to eq(6)
    end

    it 'converts suggestions into (approved) assignments' do
      suggestion = Insights::CategoryAssignment.create(
        input: inputs.first,
        category: categories.first,
        approved: false
      )

      assignment_ids = nil
      expect { assignment_ids = service.add_assignments_batch(inputs, categories) }
        .to(change { suggestion.reload.approved }.from(false).to(true))
      expect(assignment_ids.length).to eq(6)
    end

    it 'sets a processed_flag for the inputs' do
      service.add_assignments_batch(inputs, categories)

      aggregate_failures 'checking inputs processed flags' do
        inputs.each { |input|
          expect(input.processed(view)).to eq(true)
        }
      end
    end
  end

  describe '#add_suggestions_batch' do
    let(:inputs) { create_list(:idea, 2) }
    let(:view) { create(:view) }
    let(:view_id) { view.id }
    let(:categories) { create_list(:category, 3, view: view) }
    it 'creates suggestions' do
      assignment_ids = service.add_suggestions_batch(inputs, categories)
      assignments = Insights::CategoryAssignment.find(assignment_ids)

      aggregate_failures 'checking assignments' do
        expect(assignment_ids.length).to eq(6)
        expect(assignments.map(&:approved?).all?).to be(false)
        expect(assignments.pluck(:input_id).uniq).to match(inputs.pluck(:id))
        expect(assignments.pluck(:category_id).uniq).to match(categories.pluck(:id))
      end
    end

    it 'raises an error for inputs with bad type' do
      expect { service.add_suggestions_batch([create(:comment)], categories) }
        .to raise_error(ArgumentError)
    end

    it "doesn't touch existing suggestion" do
      suggestion = Insights::CategoryAssignment.create(
        input: inputs.first,
        category: categories.first,
        approved: false
      )

      assignment_ids = nil
      expect { assignment_ids = service.add_suggestions_batch(inputs, categories) }
        .not_to(change { suggestion.reload.updated_at })
      expect(assignment_ids.length).to eq(5)
    end

    it "doesn't convert approved categories to suggestions" do
      assignment = Insights::CategoryAssignment.create(input: inputs.first, category: categories.first)

      assignment_ids = service.add_suggestions_batch(inputs, categories)
      expect(assignment_ids.length).to eq(5)
      expect(assignment.reload.approved).to eq(true)
    end

    it 'doesn\'t set a processed_flag for the inputs' do
      service.add_suggestions_batch(inputs, categories)

      aggregate_failures 'checking inputs processed flags' do
        inputs.each { |input|
          expect(input.processed(view)).to eq(false)
        }
      end
    end
  end
end
