# frozen_string_literal: true

require 'json'

module NLP
  module ZeroshotClassificationMessage
    attr_reader :payload

    def initialize(payload)
      @payload = payload.is_a?(String) ? JSON.parse(payload) : payload
      @payload.freeze
    end

    # @return[String]
    def task_id
      payload['task_id']
    end

    # @return[String]
    def tenant_id
      payload.dig('result', 'data', 'tenant_id')
    end

    def success?
      payload['status'] == 'SUCCESS'
    end

    # @return[Array<Prediction>]
    def predictions
      final_predictions = payload.dig('result', 'data', 'final_predictions')
      final_predictions.flat_map { |final_prediction| Prediction.from_json(final_prediction) }
    end

    class Prediction
      attr_reader :document_id, :label_id, :confidence

      def initialize(document_id, label_id, confidence)
        @document_id = document_id
        @label_id = label_id
        @confidence = confidence
      end

      # @return[Array<Prediction>]
      def self.from_json(json_prediction)
        document_id = json_prediction['id']
        json_prediction['predicted_labels'].map do |label|
          Prediction.new(document_id, label['id'], label['confidence'])
        end
      end
    end
  end
end
