# frozen_string_literal: true

module Analysis
  module LLM
    class GPT3516k < OpenAIGPT
      def context_window
        16_384
      end

      def accuracy
        0.5
      end

      def gpt_model
        'gpt-3.5-turbo-16k'
      end
    end
  end
end
