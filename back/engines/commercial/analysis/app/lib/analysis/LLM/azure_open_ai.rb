# frozen_string_literal: true

require 'openai'
require 'tiktoken_ruby'

module Analysis
  module LLM
    class AzureOpenAI < Base
      MAX_RETRIES = 20

      def initialize(**params)
        super

        @client = OpenAI::Client.new(
          access_token: ENV.fetch('AZURE_OPENAI_API_KEY'),
          uri_base: [ENV.fetch('AZURE_OPENAI_URI'), '/openai/deployments/', azure_deployment_name].join,
          api_type: :azure,
          api_version: '2025-01-01-preview',
          request_timeout: 900,
          **params
        )
      end

      def chat(prompt, **params)
        response = chat_with_retry(**default_prompt_params(prompt).deep_merge(params))
        response.dig('choices', 0, 'message', 'content')
      end

      def chat_async(prompt, **params)
        params_with_stream = default_prompt_params(prompt)
        params_with_stream[:parameters][:stream] = proc do |chunk, _bytesize|
          new_text = chunk.dig('choices', 0, 'delta', 'content')
          yield new_text
        end
        chat_with_retry(**params_with_stream.deep_merge(params))
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
        gpt_model.gsub(/[^a-zA-Z0-9-]\./, '')
      end

      def self.token_count(str)
        enc = Tiktoken.encoding_for_model('gpt-4') # same as gpt-3
        enc.encode(str).size
      end

      def default_prompt_params(prompt)
        {
          parameters: {
            model: gpt_model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            top_p: 0.5,
            frequency_penalty: 0.1
          }
        }
      end

      private

      def chat_with_retry(retries: MAX_RETRIES, **params)
        @client.chat(**params)
      rescue Faraday::TooManyRequestsError => e
        if retries <= 1
          ErrorReporter.report_msg('API request to Azure OpenAI failed', extra: { response: e.response })
          raise
        end

        # Retry after waiting between 20 and 60 seconds
        sleep_time = rand(20..60)
        sleep(sleep_time)
        chat_with_retry(retries: retries - 1, **params)
      end
    end
  end
end
