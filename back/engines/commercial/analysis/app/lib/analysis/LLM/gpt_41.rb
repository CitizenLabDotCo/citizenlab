# frozen_string_literal: true

module Analysis
  module LLM
    class GPT41 < AzureOpenAI
      def context_window
        1_000_000 # TODO: Apply 0.9 ratio to summary, qanda, and tagging
      end

      def enabled?
        true
      end

      def accuracy
        0.8
      end

      def self.gpt_model
        'gpt-4.1'
      end
    end
  end
end
