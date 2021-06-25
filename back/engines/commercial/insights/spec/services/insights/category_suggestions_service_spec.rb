# frozen_string_literal: true

require 'rails_helper'

describe Insights::CategorySuggestionsService do
  describe '.save_suggestion' do
    # Here, we always make sure the message is built in the context of the right tenant
    let(:message) { tenant.switch { build(:zsc_message, predictions_nb: 2) } }
    let(:tenant) { Tenant.find_by(name: 'test-tenant') }
    let(:task) { create_task_from_message(message) }

    # Helper to create (in DB) a zeroshot-classification task from a zeroshot-
    # classification message. In other terms, given the response from the nlp
    # service, it creates the corresponding task.
    #
    # (A bit heavy in DB queries.)
    def create_task_from_message(zsc_message)
      input_ids = zsc_message.predictions.map(&:document_id)
      inputs = Idea.where(id: input_ids)

      category_ids = zsc_message.predictions.map(&:label_id)
      categories = Insights::Category.where(id: category_ids)

      create(
        :zsc_task,
        task_id: zsc_message.task_id,
        inputs: inputs,
        categories: categories
      )
    end

    # It should work independently of the current tenant.
    before { Apartment::Tenant.reset if CitizenLab.ee? }

    context 'when the task is unknown' do
      # rubocop:disable RSpec/MultipleExpectations
      it 'ignores the message' do
        assignments = described_class.save_suggestion(message)

        expect(assignments).to be_empty
        tenant.switch do
          input_ids = message.predictions.map(&:document_id)
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
        described_class.save_suggestion(message)

        tenant.switch do
          expect { task.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      it 'saves the prediction for the right tenant' do
        assignments = described_class.save_suggestion(message)

        tenant.switch do
          expect(assignments.pluck(:input_id, :category_id))
            .to match(message.predictions.map {|p| [p.document_id, p.label_id]})
        end
      end

      # rubocop:disable RSpec/ExampleLength
      it "doesn't override (approved) assignments" do
        prediction = message.predictions.first

        tenant.switch do
          Insights::CategoryAssignment.create(
            input_id: prediction.document_id,
            input_type: 'Idea',
            category_id: prediction.label_id,
            approved: true
          )
        end

        assignments = described_class.save_suggestion(message)
        expect(assignments.length).to eq(message.predictions.length - 1)

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
    let(:nlp_client) { instance_double(NLP::API) }
    
    


  end

  describe '#input_to_text' do
    let(:input) { build(:idea) }
  end
end