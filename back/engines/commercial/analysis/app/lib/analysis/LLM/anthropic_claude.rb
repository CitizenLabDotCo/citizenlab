# frozen_string_literal: true

module Analysis
  module LLM
    class AnthropicClaude < Base
      def initialize(**params)
        super()

        if !params.key? :region
          raise 'No AWS region specified for Anthropic Claude model.'
        end

        @client = Aws::BedrockRuntime::Client.new(params)
      end

      def self.token_count(str)
        # From https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-prepare.html:
        # "Use 6 characters per token as an approximation for the number of tokens.""
        (str.size / 6.0).ceil
      end

      def accuracy
        0.4
      end

      def chat(prompt, **_params)
        resp = @client.invoke_model invoke_params(prompt)
        body_completion resp.body.string
      end

      def chat_async(prompt, **_params)
        chunk_handler = Aws::BedrockRuntime::EventStreams::ResponseStream.new
        chunk_handler.on_chunk_event do |event|
          puts body_completion(event.bytes)
        end
        @client.invoke_model_with_response_stream(**invoke_params(prompt), event_stream_handler: chunk_handler)
      end

      protected

      def model_id
        raise NotImplementedError
      end

      private

      def invoke_params(prompt)
        json = {
          'prompt' => "\n\nHuman: #{prompt}\n\nAssistant:",
          'max_tokens_to_sample' => 300,
          'temperature' => 0.1,
          'top_p' => 0.9
        }
        { model_id: model_id, body: json.to_json }
      end

      def body_completion(body_string)
        body = JSON.parse body_string
        body['completion']
      end
    end
  end
end
