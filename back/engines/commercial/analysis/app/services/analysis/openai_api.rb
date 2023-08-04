# frozen_string_literal: true

module Analysis
  # Light wrapper around the openai-ruby gem, mostly to help with test mocking
  class OpenaiApi
    def initialize(**params)
      @client = OpenAI::Client.new(**params)
    end

    def chat **params
      @client.chat(**params)
    end
  end
end
