# frozen_string_literal: true

require 'openai'
require 'tiktoken_ruby'

module Analysis
  # Light wrapper around the openai-ruby gem, mostly to help with test mocking
  class OpenaiApi
    def initialize(**params)
      @client = OpenAI::Client.new(**params)
    end

    def chat **params
      @client.chat(**params)
    end

    def token_count(str)
      enc = Tiktoken.encoding_for_model('gpt-4') # same as gpt-3
      enc.encode(str).size
    end
  end
end
