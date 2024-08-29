# frozen_string_literal: true

module Analysis
  module LLM
    class GPT35Turbo < AzureOpenAI
      def context_window
        16_384
      end

      def accuracy
        0.5
      end

      def gpt_model
        'gpt-35-turbo'
      end
    end
  end
end
