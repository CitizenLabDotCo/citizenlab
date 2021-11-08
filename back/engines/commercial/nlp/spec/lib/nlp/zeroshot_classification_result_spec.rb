# frozen_string_literal: true

require 'rails_helper'
require 'nlp/zeroshot_classification_result'

describe NLP::ZeroshotClassificationResult do
  let(:payload) do
    @response = {
      task_id: 'task-id',
      tenant_id: 'tenant-id',
      status: status,
      result: {
        data: { final_predictions: final_predictions }
      }
    }.deep_stringify_keys
  end

  let(:status) { 'SUCCESS' }
  let(:final_predictions) do
    [{
      'id' => 'document-id',
      'predicted_labels' => [{ 'confidence' => 0.9, 'id' => 'uuid-1' }, { 'confidence' => 0.4, 'id' => 'uuid-2' }]
    }]
  end

  describe '.from_json' do
    let(:zsc_result) { described_class.from_json(payload) }

    context 'when SUCCESS' do
      it { expect(zsc_result).to be_success }
      it { expect(zsc_result.task_id).to eq('task-id') }
      it { expect(zsc_result.tenant_id).to eq('tenant-id') }
      it { expect(zsc_result.predictions.length).to eq(2) }
    end

    context 'when not SUCCESS' do
      let(:status) { 'FAILURE' }

      before do
        payload.dig('result', 'data').delete('final_predictions')
      end

      it { expect(zsc_result).not_to be_success }
      it { expect(zsc_result.task_id).to eq('task-id') }
      it { expect(zsc_result.tenant_id).to eq('tenant-id') }
      it { expect(zsc_result.predictions).to eq [] }
    end
  end

  describe NLP::ZeroshotClassificationResult::Prediction do
    describe '.from_json' do
      let(:json_prediction) { final_predictions.first }

      it 'parses predictions correctly' do
        predictions = described_class.from_json(json_prediction)

        aggregate_failures 'check predictions' do
          expect(predictions.length).to eq(2)
          expect(predictions.map(&:document_id).uniq).to eq ['document-id']
          expect(predictions.map(&:label_id)).to match(%w[uuid-1 uuid-2])
          expect(predictions.map(&:confidence)).to match([0.9, 0.4])
        end
      end

      it 'gracefully handles empty list of predictions' do
        predictions = described_class.from_json({ 'id' => 'document-id', 'predicted_labels' => [] })
        expect(predictions).to be_empty
      end
    end
  end
end
