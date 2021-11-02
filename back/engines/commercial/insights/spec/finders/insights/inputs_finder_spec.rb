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
        expect(finder.execute).to match_array(inputs)
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
        params = { paginate: true, page: { size: page_size, number: 1 } }
        finder = described_class.new(view, params)
        expect(finder.execute.count).to eq(page_size)
      end

      it 'returns the rest on the last page' do
        page_size = 3
        params = { paginate: true, page: { size: 3, number: 2 } }
        finder = described_class.new(view, params)
        expect(finder.execute.count).to eq(inputs.count % page_size)
      end
    end

    context 'when using the category filter' do
      let(:category) { create(:category, view: view) }
      let(:other_category) { create(:category) }
      let!(:inputs) { create_list(:idea, 3, project: view.scope) }

      before do
        inputs.take(2).each do |input|
          assignment_service.add_assignments(input, [category])
        end
        inputs.drop(1).each do |input|
          assignment_service.add_assignments(input, [other_category])
        end
      end

      it 'can select only inputs without category' do
        finder = described_class.new(view, { category: '' })
        expect(finder.execute).to match_array(inputs.drop(2))
      end

      it 'can select inputs with a given category' do
        finder = described_class.new(view, { category: category.id })
        expect(finder.execute).to match_array(inputs.take(2))
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

    context 'when using the keywords filter' do
      let(:inputs) do
        inputs_content = [
          'dream bigger than bike lanes',
          'cell carrier is selling location data',
          'self-driving car kills woman'
        ]

        inputs_content.map do |body|
          create(:idea, project: view.scope, body_multiloc: { en: body })
        end
      end

      before do
        keywords = %w[bike car carrier]
        nodes = keywords.map { |kw| build(:text_network_node, id: kw) }
        network = build(:nlp_text_network, nodes: nodes)
        create(:insights_text_network, view: view, language: 'en', network: network)
      end

      it 'returns inputs that contains one or more keywords' do
        finder = described_class.new(view, { keywords: %w[en/bike en/carrier] })
        expect(finder.execute).to match_array(inputs.take(2))
      end

      it 'does not include partial matches' do
        finder = described_class.new(view, { keywords: ['en/car'] })
        # does not include 'carrier' when looking for 'car'
        expect(finder.execute).not_to include(inputs.second)
      end

      it 'raises an exception if the keyword does not exist' do
        finder = described_class.new(view, { keywords: ['en/imaginary'] })
        expect { finder.execute }.to raise_error(KeyError)
      end
    end

    # rubocop:disable RSpec/MultipleMemoizedHelpers
    context 'when filtering by categories' do
      let(:category_1) { create(:category, view: view) }
      let(:category_2) { create(:category, view: view) }

      let!(:input_without_category) { create(:idea, project: view.scope) }

      let!(:input_with_c1) do
        create(:idea, project: view.scope).tap do |i|
          assignment_service.add_assignments(i, [category_1])
        end
      end

      let!(:input_with_c2) do
        create(:idea, project: view.scope).tap do |i|
          assignment_service.add_suggestions(i, [category_2])
        end
      end

      it 'can select inputs without categories' do
        finder = described_class.new(view, { categories: [''] })
        expect(finder.execute).to eq [input_without_category]
      end

      it 'can select inputs from a single category' do
        finder = described_class.new(view, { categories: [category_1.id] })
        expect(finder.execute).to eq [input_with_c1]
      end

      it 'can select inputs from a set of categories' do
        category_ids = [category_1, category_2].pluck(:id)
        finder = described_class.new(view, { categories: category_ids })

        expected_inputs = [input_with_c1, input_with_c2]
        expect(finder.execute).to match_array(expected_inputs)
      end

      context 'when filtering with an unknown category' do
        let(:unknown_category) { create(:category) }

        it 'raises an exception' do
          finder = described_class.new(view, { categories: [unknown_category.id] })
          expect { finder.execute }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      context 'when an input@ has mutliple categories' do
        before do
          assignment_service.add_suggestions(input_with_c1, [category_2])
        end

        it 'does not return duplicates' do
          finder = described_class.new(view, { categories: [category_1, category_2].pluck(:id) })
          expect(finder.execute.ids.count(input_with_c1.id)).to eq(1)
        end
      end
    end
    # rubocop:enable RSpec/MultipleMemoizedHelpers

    context 'when using the processed filter' do
      let!(:inputs) { create_list(:idea, 3, project: view.scope) }

      before do
        inputs.take(2).each do |input|
          create(:processed_flag, input: input, view: view)
        end
      end

      it 'can select only unprocessed inputs' do
        finder = described_class.new(view, { processed: 'false' })
        expect(finder.execute).to match_array(inputs.drop(2))
      end

      it 'can select only processed inputs' do
        finder = described_class.new(view, { processed: 'true' })
        expect(finder.execute).to match_array(inputs.take(2))
      end

      it 'can select only processed inputs for this view' do
        create(:processed_flag, input: inputs[2])
        finder = described_class.new(view, { processed: 'true' })
        expect(finder.execute).to match_array(inputs.take(2))
      end

      it 'can select only inputs not processed in this view' do
        create(:processed_flag, input: inputs[2])
        finder = described_class.new(view, { processed: 'false' })
        expect(finder.execute).to match_array(inputs.drop(2))
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
      expect(finder.execute).to match_array([idea])
    end
  end

  describe '#per_page' do
    subject(:per_page) { described_class.new(nil, params).per_page }

    let(:params) { {} }

    it 'defaults to MAX_PER_PAGE' do
      is_expected.to eq(described_class::MAX_PER_PAGE)
    end

    context 'when page size is too large' do
      let(:params) do
        { page: { size: 2 * described_class::MAX_PER_PAGE } }
      end

      it { is_expected.to eq(described_class::MAX_PER_PAGE) }
    end

    context 'when page size is a string' do
      let(:params) { { page: { size: '20' } } }

      it 'converts it to an integer' do
        is_expected.to eq(20)
      end
    end
  end

  describe '#page' do
    subject(:page) { described_class.new(nil, params).page }

    let(:params) { {} }

    it "defaults to 1" do
      is_expected.to eq(1)
    end
  end
end
