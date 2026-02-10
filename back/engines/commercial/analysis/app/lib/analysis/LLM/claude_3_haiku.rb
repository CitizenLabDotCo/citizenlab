# frozen_string_literal: true

module Analysis
  module LLM
    class Claude3Haiku < Bedrock
      def context_window
        200_000
      end

      def accuracy
        0.6
      end

      def self.family
        'aws_anthropic'
      end

      protected

      def model_id
        'anthropic.claude-3-haiku-20240307-v1:0'
      end
    end
  end
end
