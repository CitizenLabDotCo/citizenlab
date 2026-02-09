module Analysis
  module LLM
    class ClaudeOpus45 < RubyLLM
      # The model ID as returned by RubyLLM.models.chat_models
      def model
        'eu.anthropic.claude-opus-4-5-20251101-v1:0'
      end

      def self.family
        'aws_anthropic'
      end

      def accuracy
        0.9
      end

      def chat_options
        {
          provider: 'bedrock',
          assume_model_exists: true
        }
      end

      def chat_context
        ::RubyLLM.context do |config|
          config.bedrock_secret_key = ENV.fetch('AWS_SECRET_ACCESS_KEY', nil)
          config.bedrock_api_key = ENV.fetch('AWS_ACCESS_KEY_ID', nil)
        end
      end
    end
  end
end
