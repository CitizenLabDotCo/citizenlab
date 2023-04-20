# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::CreateClassificationTasksJob do
  subject(:job) { described_class.new }

  let(:suggestion_service) { instance_spy(Insights::CategorySuggestionsService, 'suggestion_service') }
  let(:options) { { suggestion_service: suggestion_service } }

  describe '#perform' do
    let(:view) { create(:view) }

    context 'when the view has no categories' do
      it 'does not create classification tasks' do
        create_list(:idea, 2, project: view.source_projects.first)
        job.perform(view, options)
        expect(suggestion_service).not_to have_received(:classify)
      end
    end

    context 'when the view has no inputs' do
      it 'does not create classification tasks' do
        create(:category, view: view)
        job.perform(view, options)
        expect(suggestion_service).not_to have_received(:classify)
      end
    end

    context 'when the view has categories and inputs' do
      let_it_be(:view) { create(:view, nb_data_sources: 3) }
      let_it_be(:inputs) { view.source_projects.map { |p| create(:idea, project: p) } }
      let_it_be(:categories) { create_list(:category, 2, view: view) }

      it 'creates tasks for all categories and inputs' do
        job.perform(view, options)

        expect(suggestion_service).to have_received(:classify) do |inputs_arg, categories_arg|
          expect(inputs).to contain_exactly(*inputs_arg.to_a)
          expect(categories).to contain_exactly(*categories_arg.to_a)
        end
      end

      context "when 'categories' option is passed" do
        it 'creates classification tasks only for specified categories' do
          category_subset = categories.take(1)
          job.perform(view, options.merge(categories: category_subset))
          expect(suggestion_service).to have_received(:classify).with(anything, category_subset)
        end
      end

      context "when 'input_filter' option is passed" do
        it 'creates classification tasks only for relevant inputs' do
          input_filter = { processed: true, categories: categories.pluck(:id), keywords: ['keyword'] }

          expect(Insights::InputsFinder).to receive(:new).with(view, input_filter).and_call_original
          inputs = double('inputs', blank?: false)
          expect_any_instance_of(Insights::InputsFinder).to receive(:execute).and_return(inputs)

          job.perform(view, options.merge(input_filter: input_filter))

          expect(suggestion_service).to have_received(:classify).with(inputs, anything)
        end
      end
    end
  end
end
