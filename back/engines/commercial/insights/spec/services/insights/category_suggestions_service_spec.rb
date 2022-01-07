# frozen_string_literal: true

require 'rails_helper'

describe Insights::CategorySuggestionsService do
  describe '.save_suggestion' do
    # Here, we always make sure the zsc result is built in the context of the right tenant
    let(:zsc_result) { tenant.switch { build(:zsc_result, predictions_nb: 2) } }
    let(:tenant) { Tenant.find_by(name: 'test-tenant') }
    let(:task) { create_task_from_zsc_result(zsc_result) }

    # Helper to create (in DB) a zeroshot-classification task from a zeroshot-
    # classification result. In other terms, given the response from the nlp
    # service, it creates the corresponding task.
    #
    # (A bit heavy in DB queries.)
    def create_task_from_zsc_result(zsc_result)
      input_ids = zsc_result.predictions.map(&:document_id)
      inputs = Idea.where(id: input_ids)

      category_ids = zsc_result.predictions.map(&:label_id)
      categories = Insights::Category.where(id: category_ids)

      create(
        :zsc_task,
        task_id: zsc_result.task_id,
        inputs: inputs,
        categories: categories
      )
    end

    # It should work independently of the current tenant.
    before { Apartment::Tenant.reset if CitizenLab.ee? }

    context 'when the task is unknown' do
      # rubocop:disable RSpec/MultipleExpectations
      it 'ignores the result' do
        assignments = described_class.save_suggestion(zsc_result)

        expect(assignments).to be_empty
        tenant.switch do
          input_ids = zsc_result.predictions.map(&:document_id)
          expect(Insights::CategoryAssignment.where(input_id: input_ids)).not_to exist
        end
      end
      # rubocop:enable RSpec/MultipleExpectations
    end

    context 'when the task is known' do
      before do
        # create the task in the test-tenant context
        tenant.switch { task }
      end

      it 'deletes the zeroshot-classification task' do
        described_class.save_suggestion(zsc_result)

        tenant.switch do
          expect { task.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      it 'saves the prediction for the right tenant' do
        assignments = described_class.save_suggestion(zsc_result)

        tenant.switch do
          expect(assignments.pluck(:input_id, :category_id))
            .to match(zsc_result.predictions.map { |p| [p.document_id, p.label_id] })
        end
      end

      # rubocop:disable RSpec/ExampleLength
      it "doesn't override (approved) assignments" do
        prediction = zsc_result.predictions.first

        tenant.switch do
          Insights::CategoryAssignment.create(
            input_id: prediction.document_id,
            input_type: 'Idea',
            category_id: prediction.label_id,
            approved: true
          )
        end

        assignments = described_class.save_suggestion(zsc_result)
        expect(assignments.length).to eq(zsc_result.predictions.length - 1)

        tenant.switch do
          expect(
            Insights::CategoryAssignment.find_by(
              input_id: prediction.document_id,
              category_id: prediction.label_id
            )
          ).to be_approved
        end
      end
      # rubocop:enable RSpec/ExampleLength
    end
  end

  describe '#classify' do
    subject(:service) { described_class.new(nlp_client) }

    let(:nlp_client) { instance_double(NLP::Api, 'nlp_client') }
    let(:inputs) { create_list(:idea, 2) }
    let(:categories) { create_list(:category, 2) }
    let(:response) do
      {
        batches: [
          { task_id: 'task_id', doc_ids: inputs.pluck(:id), tags_ids: categories.pluck(:id) }
        ]
      }.deep_stringify_keys
    end

    it 'sends a request to the nlp service' do
      allow(nlp_client).to receive(:zeroshot_classification).and_return(response)
      tasks = service.classify(inputs, categories)

      aggregate_failures 'checking created task' do
        expect(tasks.length).to eq(1)
        expect(tasks.first.categories).to match_array(categories)
        expect(tasks.first.inputs).to match_array(inputs)
      end
    end
  end

  describe '#input_to_text' do
    using RSpec::Parameterized::TableSyntax

    subject(:service) { described_class.new }

    where(:input_title, :input_body, :result) do
      'title'  | 'simple body'                           | 'title. simple body'
      'title ' | 'simple body'                           | 'title. simple body'
      'title.' | '  simple body   '                      | 'title. simple body'
      'title.' | '<p> line 1<br> line 2<br> line 3 </p>' | 'title. line 1 line 2 line 3'
    end

    with_them do
      it 'converts input to text correctly' do
        input = create(:idea, title_multiloc: { en: input_title }, body_multiloc: { en: input_body })
        expect(service.send(:input_to_text, input)).to eq(result)
      end
    end
  end

  describe '#input_to_document' do
    subject(:service) { described_class.new }

    let(:title) { 'The title'}
    let(:body) { 'The body...'}
    let(:input) do
      create(:idea, body_multiloc: { en: body }, title_multiloc: { en: title })
    end

    it 'converts an input into a document correctly' do
      document = service.send(:input_to_document, input)

      expected_text = "#{title}. #{body}"
      expect(document).to eq({ text: expected_text, doc_id: input.id })
    end
  end
end
