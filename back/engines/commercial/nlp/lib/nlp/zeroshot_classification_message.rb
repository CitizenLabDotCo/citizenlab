# frozen_string_literal: true

require 'json'

module NLP
  class ZeroshotClassificationMessage
    attr_reader :task_id, :tenant_id, :predictions, :json_message # is only initialized if the instance is created with +.from_json+

    # @param [String] task_id
    # @param [String, nil] tenant_id
    # @param [Boolean] is_success
    # @param [Array<Prediction>] predictions
    def initialize(task_id, tenant_id: nil, is_success: true, predictions: [])
      @task_id = task_id
      @tenant_id = tenant_id
      @is_success = is_success
      @predictions = predictions
    end

    def success?
      @is_success
    end

    def self.from_json(json_message)
      @json_message = json_message.is_a?(String) ? JSON.parse(json_message) : json_message

      predictions = @json_message.dig('result', 'data', 'final_predictions')
                                 .flat_map { |json_prediction| Prediction.from_json(json_prediction) }

      new(
        @json_message.fetch('task_id'), # raises an exception if the key is missing
        tenant_id: @json_message.dig('result', 'data', 'tenant_id'),
        is_success: @json_message['status'] == 'SUCCESS',
        predictions: predictions
      )
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
