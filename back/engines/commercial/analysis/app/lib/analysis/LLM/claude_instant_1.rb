# frozen_string_literal: true

module Analysis
  module LLM
    class ClaudeInstant1 < AnthropicClaude
      def context_window
        # From https://docs.anthropic.com/claude/reference/input-and-output-sizes
        100_000
      end

      protected

      def model_id
        'anthropic.claude-instant-v1'
      end
    end
  end
end
