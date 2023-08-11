# frozen_string_literal: true

require 'openai'
require 'tiktoken_ruby'

module Analysis
  module LLM
    class OpenAIGPT < Base
      def initialize(**params)
        super
        @client = OpenAI::Client.new(**params)
      end

      def chat(**params)
        @client.chat(**params)
      end

      def self.token_count(str)
        enc = Tiktoken.encoding_for_model('gpt-4') # same as gpt-3
        enc.encode(str).size
      end
    end
  end
end
