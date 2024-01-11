# frozen_string_literal: true

module Analysis
  module LLM
    class Claude21 < Base
      def initialize(**params)
        super
        @client = Aws::BedrockRuntime::Client.new
      end

      def context_window
        # From https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-claude.html:
        # "To avoid timeouts with Anthropic Claude version 2.1, we recommend limiting the input
        # token count in the prompt field to 180K. We expect to address this timeout issue soon."
        180_000
      end

      def self.token_count(str)
        # From https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-prepare.html:
        # "Use 6 characters per token as an approximation for the number of tokens.""
        (str.size / 6.0).ceil
      end

      def accuracy
        0.4
      end

      def chat(prompt, **params)
        resp = @client.invoke_model(
          model_id: 'anthropic.claude-v2:1',
          body: prompt
        )
        resp.body
      end

      def chat_async(prompt, **params)
        raise NotImplementedError
      end
    end
  end
end
