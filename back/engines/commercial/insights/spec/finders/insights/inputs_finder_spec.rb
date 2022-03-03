# frozen_string_literal: true

require 'rails_helper'

describe Insights::InputsFinder do
  describe '#execute' do
    subject(:finder_result) { described_class.new(view, params).execute }

    let(:view) { create(:empty_view) }
    let(:params) { {} }

    def add_data_source(view, input_count = 0)
      project = create(:project)
      create_list(:idea, input_count, project: project)
      view.data_sources.create(origin: project)
    end

    context 'when the view has no data sources' do
      it { is_expected.to be_empty }
    end

    context "when view's origins are empty" do
      before do
        add_data_source(view)
        add_data_source(view)
      end

      it { is_expected.to be_empty }
    end

    context 'without optional parameters' do
      before do
        add_data_source(view, 1)
        add_data_source(view, 2)
      end

      it 'returns inputs from all origins' do
        expect(finder_result.count).to eq(3)
      end
    end

    context 'when using pagination' do
      let(:input_count) { 5 }
      let(:page_size) { 3 }
      let(:params) { { paginate: true, page: { size: page_size, number: page_number } } }

      before { add_data_source(view, 5) }

      describe 'page 1' do
        let(:page_number) { 1 }

        it 'is full' do
          expect(finder_result.count).to eq(page_size)
        end
      end

      describe 'page 2' do
        let(:page_number) { 2 }

        it 'contains only the last items' do
          expect(finder_result.count).to eq(input_count % page_size)
        end
      end
    end

    context 'when using the keywords filter' do
      let(:origin) { add_data_source(view).origin }

      let(:inputs) do
        inputs_content = [
          'dream bigger than bike lanes',
          'cell carrier is selling location data',
          'self-driving car kills woman'
        ]

        inputs_content.map do |body|
          create(:idea, project: origin, body_multiloc: { en: body })
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
      let(:origin) { add_data_source(view).origin }
      let(:category_1) { create(:category, view: view) }
      let(:category_2) { create(:category, view: view) }

      let!(:input_without_category) { create(:idea, project: origin) }

      let!(:input_with_c1) do
        create(:idea, project: origin).tap { |i| add_categories(i, category_1) }
      end

      let!(:input_with_c2) do
        create(:idea, project: origin).tap { |i| add_categories(i, category_2) }
      end

      def add_categories(input, *categories)
        Insights::CategoryAssignmentsService.new.add_assignments(input, categories)
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

      context 'when an input has mutliple categories' do
        before { add_categories(input_with_c1, category_2) }

        it 'does not return duplicates' do
          finder = described_class.new(view, { categories: [category_1, category_2].pluck(:id) })
          expect(finder.execute.ids.count(input_with_c1.id)).to eq(1)
        end
      end
    end
    # rubocop:enable RSpec/MultipleMemoizedHelpers

    context 'when using the processed filter' do
      let!(:inputs) { add_data_source(view, 3).origin.ideas }

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
      let!(:inputs) { add_data_source(view, 3).origin.ideas }

      before do
        assignment_service = Insights::CategoryAssignmentsService.new
        assignment_service.add_suggestions(inputs.first, [category])
        assignment_service.add_assignments(inputs.second, [category])
      end

      def get_assignment(input, category)
        input.insights_category_assignments.find_by(category: category)
      end

      context '(asc)' do
        let(:params) { { category: category.id, sort: 'approval' } }

        it 'returns inputs with approved assignments first' do
          approved_status = finder_result.map { |i| get_assignment(i, category).approved? }
          expect(approved_status).to eq([true, false])
        end
      end

      context '(desc)' do
        let(:params) { { category: category.id, sort: '-approval' } }

        it 'returns inputs with suggestions first' do
          approved_status = finder_result.map { |i| get_assignment(i, category).approved? }
          expect(approved_status).to eq([false, true])
        end
      end

      context 'when not filtering using a (single) category' do
        let(:params) { { sort: 'approval' } }

        it 'does not order inputs by approval status' do
          is_ordered = finder_result
                         .order_values
                         .any? { |o| o.to_sql.include?('"insights_category_assignments"."approved"') }
          expect(is_ordered).to be false
        end
      end
    end

    context 'using text search' do
      let(:params) { { search: 'peace' } }

      before do
        origin = add_data_source(view).origin
        @input = create(:idea, title_multiloc: { en: 'Peace in the world ☮' }, project: origin)
        _just_another_input = create(:idea, project: origin) # to have a least two inputs
      end

      it 'returns inputs that match the text query' do
        expect(finder_result).to match_array([@input])
      end
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
