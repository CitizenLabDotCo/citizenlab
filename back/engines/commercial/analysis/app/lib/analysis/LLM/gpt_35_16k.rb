# frozen_string_literal: true

module Analysis
  module LLM
    class GPT3516k < OpenAIGPT
      def context_window
        16_384
      end

      def accuracy
        :medium
      end

      def accuracy_score
        5
      end
    end
  end
end
