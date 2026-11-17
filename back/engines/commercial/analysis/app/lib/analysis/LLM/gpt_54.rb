# frozen_string_literal: true

module Analysis
  module LLM
    class GPT54 < AzureOpenAI
      def context_window
        1_000_000
      end

      def enabled?
        true
      end

      def accuracy
        0.9
      end

      def self.gpt_model
        'gpt-5.4'
      end

      private

      # gpt-5.x reasoning models reject sampling parameters.
      def default_params
        super.except(:temperature, :top_p)
      end
    end
  end
end
