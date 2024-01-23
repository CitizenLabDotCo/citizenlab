# frozen_string_literal: true

module Analysis
  module LLM
    class Claude21 < AnthropicClaude

      def context_window
        # From https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-claude.html:
        # To avoid timeouts with Anthropic Claude version 2.1, we recommend limiting the input
        # token count in the prompt field to 180K. We expect to address this timeout issue soon.
        180_000
      end

      def accuracy
        0.5
      end

      protected

      def model_id
        'anthropic.claude-v2:1'
      end
    end
  end
end
