# frozen_string_literal: true

require 'rails_helper'
require 'nlp/zeroshot_classification_message'

describe NLP::ZeroshotClassificationMessage do
  describe NLP::ZeroshotClassificationMessage::Prediction do
    describe '.from_json' do
      let(:document_id) { 'the-document-id' }
      let(:json_prediction) do
        {
          'id' => document_id,
          'predicted_labels' => [
            { 'confidence' => 0.93, 'id' => 'sea-lion-id' },
            { 'confidence' => 0.45, 'id' => 'shark-id' }
          ]
        }
      end

      it 'parses predictions correctly' do
        predictions = described_class.from_json(json_prediction)

        aggregate_failures 'check predictions' do
          expect(predictions.length).to eq(2)
          expect(predictions.map(&:document_id).uniq).to eq [document_id]
          expect(predictions.map(&:label_id)).to match(%w[sea-lion-id shark-id])
          expect(predictions.map(&:confidence)).to match([0.93, 0.45])
        end
      end

      it 'gracefully handles empty list of predictions' do
        predictions = described_class.from_json({'id' => document_id, 'predicted_labels' => [] })
        expect(predictions).to be_empty
      end
    end
  end
end
