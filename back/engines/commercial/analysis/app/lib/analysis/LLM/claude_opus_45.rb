module Analysis
  module LLM
    class ClaudeOpus45 < Bedrock
      def initialize
        super(
          region: ENV.fetch('AWS_REGION', 'eu-central-1'),
          access_key_id: ENV.fetch('AWS_ACCESS_KEY_ID', nil),
          secret_access_key: ENV.fetch('AWS_SECRET_ACCESS_KEY', nil)
        )
      end

      def self.family
        'aws_anthropic'
      end

      def context_window
        1_000_000
      end

      def accuracy
        0.9
      end

      protected

      def model_id
        'eu.anthropic.claude-opus-4-5-20251101-v1:0'
      end

      def additional_model_request_fields
        { 'anthropic_beta' => ['context-1m-2025-08-07'] }
      end

      private

      def inference_config
        {
          max_tokens: 16_384,
          temperature: 0.1
        }
      end
    end
  end
end
