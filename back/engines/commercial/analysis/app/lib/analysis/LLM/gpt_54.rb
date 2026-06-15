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

      # tiktoken_ruby doesn't know the gpt-5 series yet, so we can't derive the
      # encoding from the model name. The gpt-5 series uses the same o200k_base
      # encoding as gpt-4o/gpt-4.1.
      def token_count(str)
        enc = Tiktoken.get_encoding(:o200k_base)
        enc.encode(str).size
      end

      private

      # gpt-5.x reasoning models reject sampling parameters.
      def default_params
        super.except(:temperature, :top_p)
      end
    end
  end
end
