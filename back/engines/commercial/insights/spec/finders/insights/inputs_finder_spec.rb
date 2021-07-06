# frozen_string_literal: true

require 'rails_helper'

describe Insights::InputsFinder do
  describe '#execute' do

    def assignment_service
      Insights::CategoryAssignmentsService.new
    end

    let(:view) { create(:view) }

    context 'without params' do
      let(:finder) { described_class.new(view) }
      let!(:inputs) { create_list(:idea, 2, project: view.scope) }


      it 'returns all inputs' do
        expect(finder.execute).to match(inputs)
      end
    end

    context 'when view scope has no input' do
      it 'returns 0 input' do
        finder = described_class.new(create(:view))
        expect(finder.execute.count).to eq(0)
      end
    end

    context 'when page size is smaller than the nb of inputs' do
      let!(:inputs) { create_list(:idea, 5, project: view.scope) }

      it 'trims inputs on the first page' do
        page_size = 3
        params = { page: { size: page_size, number: 1 } }
        finder = described_class.new(view, params)
        expect(finder.execute.count).to eq(page_size)
      end

      it 'returns the rest on the last page' do
        page_size = 3
        params = { page: { size: 3, number: 2 } }
        finder = described_class.new(view, params)
        expect(finder.execute.count).to eq(inputs.count % page_size)
      end
    end

    context 'when using the category filter' do
      let(:category) { create(:category, view: view) }
      let!(:inputs) { create_list(:idea, 3, project: view.scope) }


      before do
        inputs.take(2).each do |input|
          assignment_service.add_assignments(input, [category])
        end
      end

      it 'can select only inputs without category' do
        finder = described_class.new(view, { category: '' })
        expect(finder.execute).to match(inputs.drop(2))
      end

      it 'can select inputs with a given category' do
        finder = described_class.new(view, { category: category.id })
        expect(finder.execute).to match(inputs.take(2))
      end

      it 'succeeds with categories without assignments' do
        category = create(:category, view: view)
        finder = described_class.new(view, { category: category.id })
        expect(finder.execute.count).to eq(0)
      end

      it 'raises an exception if the category belongs to another view' do
        category = create(:category)
        finder = described_class.new(view, { category: category.id })
        expect { finder.execute }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when using the processed filter' do
      let!(:inputs) { create_list(:idea, 3, project: view.scope) }

      before do
        inputs.take(2).each do |input|
          create(:processed_flag, input: input, view: view)
        end

      end

      it 'can select only unprocessed inputs' do
        finder = described_class.new(view, { processed: 'false' })
        expect(finder.execute).to match(inputs.drop(2))
      end

      it 'can select only processed inputs' do
        finder = described_class.new(view, { processed: 'true' })
        expect(finder.execute).to match(inputs.take(2))
      end

      it 'can select only processed inputs for this view' do
        create(:processed_flag, input: inputs[2])
        finder = described_class.new(view, { processed: 'true' })
        expect(finder.execute).to match(inputs.take(2))
      end
    end

    context 'when sorting by approval status' do
      let(:category) { create(:category, view: view) }
      let!(:inputs) { create_list(:idea, 3, project: view.scope) }


      before do
        inputs = view.scope.ideas
        assignment_service.add_suggestions(inputs.first, [category])
        assignment_service.add_assignments(inputs.second, [category])
      end

      it 'returns inputs with approved categories first' do
        finder = described_class.new(view, { category: category.id, sort: 'approval' })
        inputs = finder.execute

        aggregate_failures('checking results') do
          expect(inputs.count).to eq(2)
          expect(inputs.first.insights_category_assignments.first).to be_approved
        end
      end

      it 'does not change order if not filtered by category' do
        finder = described_class.new(view, { sort: 'approval' })
        inputs = finder.execute

        aggregate_failures('checking results') do
          expect(inputs.count).to eq(3)
          expect(inputs.first.insights_category_assignments.first).not_to be_approved
        end
      end
    end

    context 'when sorting by approval status (desc)' do
      let(:category) { create(:category, view: view) }
      let!(:inputs) { create_list(:idea, 3, project: view.scope) }

      before do
        inputs = view.scope.ideas
        assignment_service.add_assignments(inputs.first, [category])
        assignment_service.add_suggestions(inputs.second, [category])
      end

      it 'returns inputs with approved categories first' do
        finder = described_class.new(view, { category: category.id, sort: '-approval' })
        inputs = finder.execute

        aggregate_failures('checking results') do
          expect(inputs.count).to eq(2)
          expect(inputs.first.insights_category_assignments.first).not_to be_approved
        end
      end
    end

    it 'supports text search' do
      idea = create(:idea, title_multiloc: { en: 'Peace in the world ☮' }, project: view.scope)
      _just_another_idea = create(:idea, project: view.scope) # to have a least two inputs

      finder = described_class.new(view, { search: 'peace' })
      expect(finder.execute).to match([idea])
    end
  end

  describe '#per_page' do
    subject(:finder) { described_class.new(nil, params) }

    let(:params) { {} }

    context 'when page size is above the limit' do
      let(:params) do
        { page: { size: 2 * described_class::MAX_PER_PAGE } }
      end

      it { expect(finder.per_page).to eq(described_class::MAX_PER_PAGE) }
    end

    context 'when page size is a string' do
      let(:params) { { page: { size: '20' } } }

      it 'converts it to an integer' do
        expect(finder.per_page).to eq(20)
      end
    end
  end
end
