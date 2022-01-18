# frozen_string_literal: true

require 'json'
require 'nlp/text_network'

module NLP
  # Data class for results of text network analysis.
  class TextNetworkAnalysisResult
    attr_reader :task_id, :tenant_id, :locale, :network
    attr_reader :json_message # is only initialized if the instance is created with +.from_json+

    # @param [String] task_id
    # @param [String] tenant_id
    # @param [Boolean] is_success
    # @param [String] locale
    # @param [NLP::TextNetwork] network
    def initialize(task_id, tenant_id, is_success, locale, network)
      @task_id = task_id
      @tenant_id = tenant_id
      @is_success = is_success
      @locale = locale
      @network = network
    end

    def success?
      @is_success
    end

    def self.from_json(json_message)
      @json_message = json_message.is_a?(String) ? JSON.parse(json_message) : json_message

      data = @json_message.dig('result', 'data').to_h

      # Using fetch to raise exceptions if keys are missing
      # [TODO] use jsonschema to validate the payload
      network = NLP::TextNetwork.from_json(data.fetch('result'))

      new(
        @json_message.fetch('task_id'),
        @json_message.fetch('tenant_id'),
        @json_message.fetch('status') == 'SUCCESS',
        data.fetch('locale'),
        network
      )
    end
  end
end
