# frozen_string_literal: true

module Analysis
  module LLM
    class GPT432k < OpenAIGPT
      def context_window
        32_768
      end

      def enabled?
        false
      end

      def accuracy
        0.7
      end

      def gpt_model
        'gpt-4-32k'
      end
    end
  end
end
