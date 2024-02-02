# frozen_string_literal: true

require 'openai'
require 'tiktoken_ruby'

module Analysis
  module LLM
    class AzureOpenAI < Base
      def initialize(**params)
        super

        @client = OpenAI::Client.new(**{
          access_token: ENV.fetch('AZURE_OPENAI_API_KEY'),
          uri_base: [ENV.fetch('AZURE_OPENAI_URI'), '/openai/deployments/', azure_deployment_name].join,
          api_type: :azure,
          api_version: '2023-09-01-preview',
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

      # On Azure, each model needs to be deployed separately and given its own
      # name. To avoid having to introduce an extra deployment_name parameter
      # per model in our configuration, we derive the deployment name from the
      # model name, stripping out any characters that are not allowed in Azure
      # deployment names.
      def azure_deployment_name
        gpt_model.gsub(/[^a-zA-Z0-9-]/, '')
      end

      def self.token_count(str)
        enc = Tiktoken.encoding_for_model('gpt-4') # same as gpt-3
        enc.encode(str).size
      end
    end
  end
end
