# frozen_string_literal: true

module Analysis
  module LLM
    class GPT48k < OpenAIGPT
      def context_window
        8192
      end

      def accuracy
        0.8
      end

      def gpt_model
        'gpt-4'
      end
    end
  end
end
