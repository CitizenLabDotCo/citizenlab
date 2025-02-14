# frozen_string_literal: true

module Analysis
  module LLM
    class Bedrock < Base
      def initialize(**params)
        super()

        if !params.key? :region
          raise 'No AWS region specified.'
        end

        @client = Aws::BedrockRuntime::Client.new(params)
      end

      def self.token_count(str)
        # From https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-prepare.html:
        # "Use 6 characters per token as an approximation for the number of tokens."
        (str.size / 6.0).ceil
      end

      def accuracy
        raise NotImplementedError
      end

      def chat(prompt, **params)
        response = @client.converse(
          model_id:,
          messages: messages(prompt, params[:assistant_prefix] || ''),
          inference_config:
        )
        response.output.message.content.first.text
      end

      def chat_async(prompt, **params)
        handler = Aws::BedrockRuntime::EventStreams::ConverseStreamOutput.new
        handler.on_content_block_delta_event do |event|
          yield(event.delta.text)
        end
        @client.converse_stream(
          model_id:,
          messages: messages(prompt, params[:assistant_prefix] || ''),
          inference_config:,
          event_stream_handler: handler
        )
      end

      protected

      def model_id
        raise NotImplementedError
      end

      private

      def inference_config
        {
          max_tokens: 300,
          temperature: 0.1,
          top_p: 0.9
        }
      end

      def messages(prompt, assistant_prefix)
        [
          {
            role: 'user',
            content: [
              {
                text: prompt
              }
            ]
          },
          if assistant_prefix.empty?
            nil
          else
            {
              role: 'assistant',
              content: [
                {
                  text: assistant_prefix
                }
              ]
            }
          end
        ].compact
      end

      def invoke_params(prompt, **params)
        assistant_prefix = params[:assistant_prefix] || ''
        json = {
          'prompt' => "\n\nHuman: #{prompt}\n\nAssistant: #{assistant_prefix}",
          'max_tokens_to_sample' => 300,
          'temperature' => 0.1,
          'top_p' => 0.9
        }
        { model_id: model_id, body: json.to_json, content_type: 'application/json' }
      end

      def body_completion(body_string)
        body = JSON.parse body_string
        body['completion']
      end
    end
  end
end
