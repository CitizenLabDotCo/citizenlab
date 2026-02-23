# frozen_string_literal: true

module Analysis
  module LLM
    class GPT5 < AzureOpenAI
      def context_window
        1_000_000
      end

      def enabled?
        true
      end

      def accuracy
        0.8
      end

      def self.gpt_model
        'gpt-5'
      end

      def chat(...)
        resp = response(...)
        message_output = resp&.dig('output')&.find { |o| o['type'] == 'message' }
        message_output&.dig('content', 0, 'text')
      end

      private

      def default_params
        {
          model: self.class.azure_deployment_name,
          store: false
        }
      end
    end
  end
end
