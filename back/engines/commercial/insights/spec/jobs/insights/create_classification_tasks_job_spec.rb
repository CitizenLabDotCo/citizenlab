# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::CreateClassificationTasksJob, type: :job do
  subject(:job) { described_class.new }

  let(:suggestion_service) { instance_spy(Insights::CategorySuggestionsService, 'suggestion_service') }

  def create_view(input_counts, category_counts)
    create(:view).tap do |view|
      create_list(:category, category_counts, view: view)
      create_list(:idea, input_counts, project: view.scope)
    end
  end

  describe '#perform' do
    context 'when only view is provided' do
      let(:view) { create_view(2, 1) }

      # rubocop:disable RSpec/MultipleExpectations
      it 'triggers classification tasks for the right inputs/categories' do
        job.perform(view: view, suggestion_service: suggestion_service)

        expect(suggestion_service).to have_received(:classify) do |inputs, categories|
          aggregate_failures('check counts') do
            expect(inputs.count).to eq(2)
            expect(categories.count).to eq(1)
          end
        end
      end
      # rubocop:enable RSpec/MultipleExpectations
    end

    context 'when inputs & categories are specified explicitly' do
      let(:view) { create_view(3, 2) }
      let(:inputs) { view.scope.ideas.take(2) }
      let(:categories) { view.categories.take(1) }

      # rubocop:disable RSpec/ExampleLength, RSpec/MultipleExpectations
      it 'triggers classification tasks for the right inputs/categories' do
        job.perform(
          inputs: inputs,
          categories: categories,
          view: view,
          suggestion_service: suggestion_service
        )

        expect(suggestion_service).to have_received(:classify) do |inputs, categories|
          aggregate_failures('check params') do
            expect(inputs).to match(inputs)
            expect(categories).to match(categories)
          end
        end
      end
    end
    # rubocop:enable RSpec/ExampleLength, RSpec/MultipleExpectations

    context 'when there is no inputs or categories' do
      using RSpec::Parameterized::TableSyntax

      where(:input_count, :category_count, :with_view) do
        nil | nil |  true # only an empty view
          0 |   0 | false
          1 |   0 | false
          0 |   1 |  true
      end

      with_them do
        specify do
          view = create(:view)
          inputs = create_list(:idea, input_count, project: view.scope) if input_count
          categories = create_list(:category, category_count, view: view) if category_count

          params = {
            inputs: inputs,
            categories: categories,
            view: with_view ? view : nil
          }.compact

          job.perform(params)
          expect(suggestion_service).not_to have_received(:classify)
        end
      end
    end
  end
end
