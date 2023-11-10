# frozen_string_literal: true

module Analysis
  module LLM
    class GPT4Turbo < OpenAIGPT
      def context_window
        128_000
      end

      def enabled?
        true
      end

      def accuracy
        0.7
      end

      def gpt_model
        'gpt-4-1106-preview'
      end
    end
  end
end
