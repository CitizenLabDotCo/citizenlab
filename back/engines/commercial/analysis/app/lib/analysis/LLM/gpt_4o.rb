# frozen_string_literal: true

module Analysis
  module LLM
    class GPT4o < AzureOpenAI
      def context_window
        128_000
      end

      def enabled?
        true
      end

      def accuracy
        0.8
      end

      def gpt_model
        'gpt-4o'
      end
    end
  end
end
