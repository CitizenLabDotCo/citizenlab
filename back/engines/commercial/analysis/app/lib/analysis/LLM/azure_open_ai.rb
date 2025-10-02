# frozen_string_literal: true

require 'openai'
require 'tiktoken_ruby'

module Analysis
  module LLM
    class AzureOpenAI < Base
      class << self
        def gpt_model
          raise NotImplementedError
        end

        # On Azure, each model needs to be deployed separately and given its own
        # name. To avoid having to introduce an extra deployment_name parameter
        # per model in our configuration, we derive the deployment name from the
        # model name, stripping out any characters that are not allowed in Azure
        # deployment names.
        def azure_deployment_name
          gpt_model.gsub(/[^\w.-]/, '')
        end

        def headroom_ratio
          0.85
        end
      end

      attr_reader :response_client

      def initialize(**client_config)
        super

        @response_client = OpenAI::Client.new(
          access_token: ENV.fetch('AZURE_OPENAI_API_KEY'),
          uri_base: "#{ENV.fetch('AZURE_OPENAI_URI')}/openai/v1/",
          api_type: :azure,
          request_timeout: 900,
          **client_config
        ).responses
      end

      def response(message, **params)
        parameters = default_params.merge(input: message).deep_merge(params)

        if block_given?
          parameters[:stream] = proc do |chunk, _event|
            yield chunk['delta'] if chunk['type'] == 'response.output_text.delta'
          end
        end

        response_client.create(parameters:)
      end

      def chat(...)
        # response returns "" if streaming is used
        response(...).presence&.dig('output', 0, 'content', 0, 'text')
      end
      alias chat_async chat

      def token_count(str)
        enc = Tiktoken.encoding_for_model(self.class.gpt_model)
        enc.encode(str).size
      end

      private

      def default_params
        {
          model: self.class.azure_deployment_name,
          temperature: 0.2,
          top_p: 0.5,
          store: false # prevent OpenAI from storing the prompts and responses
        }
      end
    end
  end
end
