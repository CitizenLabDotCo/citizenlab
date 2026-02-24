# frozen_string_literal: true

module Analysis
  module LLM
    class Bedrock < Base
      def initialize(**params)
        super()

        if !params.key? :region
          raise 'No AWS region specified.'
        end

        @client = Aws::BedrockRuntime::Client.new(
          **params,
          http_read_timeout: 300,
          http_open_timeout: 10
        )
      end

      def token_count(str)
        # From https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-prepare.html:
        # "Use 6 characters per token as an approximation for the number of tokens."
        (str.size / 6.0).ceil
      end

      def accuracy
        raise NotImplementedError
      end

      # @param prompt [String, Analysis::LLM::Message]
      def chat(prompt, **params)
        converse_params = {
          model_id:,
          messages: build_messages(prompt, params[:assistant_prefix] || ''),
          inference_config:
        }

        additional = additional_model_request_fields
        converse_params[:additional_model_request_fields] = additional if additional

        response = @client.converse(**converse_params)
        response.output.message.content.first.text
      end

      # @param prompt [String, Analysis::LLM::Message]
      def chat_async(prompt, **params)
        handler = Aws::BedrockRuntime::EventStreams::ConverseStreamOutput.new
        handler.on_content_block_delta_event do |event|
          yield(event.delta.text)
        end

        converse_params = {
          model_id:,
          messages: build_messages(prompt, params[:assistant_prefix] || ''),
          inference_config:,
          event_stream_handler: handler
        }

        additional = additional_model_request_fields
        converse_params[:additional_model_request_fields] = additional if additional

        @client.converse_stream(**converse_params)
      end

      protected

      def model_id
        raise NotImplementedError
      end

      # Override in subclass to pass additional fields to the Bedrock Converse API.
      # E.g. { 'anthropic_beta' => ['context-1m-2025-08-07'] }
      def additional_model_request_fields
        nil
      end

      private

      def inference_config
        {
          max_tokens: 300,
          temperature: 0.1
        }
      end

      def build_messages(prompt, assistant_prefix)
        user_message = if prompt.is_a?(String)
          { role: 'user', content: [{ text: prompt }] }
        else
          message = Message.wrap(prompt)
          { role: message.role, content: message.inputs.map { |input| format_input(input) } }
        end

        [
          user_message,
          if assistant_prefix.empty?
            nil
          else
            { role: 'assistant', content: [{ text: assistant_prefix }] }
          end
        ].compact
      end

      def format_input(input)
        case input
        when String
          { text: input }
        when Files::File
          format_file(input)
        else
          raise ArgumentError, "Unsupported content type: #{input.class}. Must be String or Files::File."
        end
      end

      def format_file(file)
        if file.image?
          format = file.mime_type.split('/').last.sub('jpg', 'jpeg')
          { image: { format:, source: { bytes: file.content.read } } }
        elsif file.mime_type == 'application/pdf'
          { document: { format: 'pdf', name: ::File.basename(file.name, '.*'), source: { bytes: file.content.read } } }
        elsif file.preview.present? && file.preview.status == 'completed'
          { document: { format: 'pdf', name: ::File.basename(file.name, '.*'), source: { bytes: file.preview.content.read } } }
        else
          raise UnsupportedAttachmentError, file.mime_type
        end
      end
    end
  end
end
