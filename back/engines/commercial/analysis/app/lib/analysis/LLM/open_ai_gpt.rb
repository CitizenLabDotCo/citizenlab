# frozen_string_literal: true

require 'openai'
require 'tiktoken_ruby'

module Analysis
  module LLM
    class OpenAIGPT < Base
      def initialize(**params)
        super
        @client = OpenAI::Client.new(**{
          access_token: ENV.fetch('OPENAI_API_KEY'),
          request_timeout: 480
        }.merge(params))
      end

      def chat(prompt, **params)
        default_params = {
          parameters: {
            model: gpt_model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1
          }
        }
        response = @client.chat(**default_params.deep_merge(params))
        response.dig('choices', 0, 'message', 'content')
      end

      def chat_async(prompt, **params)
        default_params = {
          parameters: {
            model: gpt_model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            stream: proc do |chunk, _bytesize|
              new_text = chunk.dig('choices', 0, 'delta', 'content')
              yield new_text
            end
          }
        }
        @client.chat(**default_params.deep_merge(params))
      end

      def gpt_model
        raise NotImplementedError
      end

      def self.token_count(str)
        enc = Tiktoken.encoding_for_model('gpt-4') # same as gpt-3
        enc.encode(str).size
      end
    end
  end
end
