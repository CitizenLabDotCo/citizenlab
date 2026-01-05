# frozen_string_literal: true

require 'openai'
require 'tiktoken_ruby'

module Analysis
  module LLM
    class AzureOpenAI < Base
      MAX_RETRIES = 20

      SUPPORTED_IMAGE_TYPES = %w[
        image/gif
        image/jpeg
        image/jpg
        image/png
        image/webp
      ].freeze

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

      def self.family
        'azure_openai'
      end

      # @param message [String, Analysis::LLM::Message, Array<String, Analysis::LLM::Message>]
      #   The message(s) to send to the model.
      def response(message, retries: MAX_RETRIES, **params)
        inputs = Array.wrap(message)
          .map { |m| Message.wrap(m) }
          .map { |m| format_message(m) }

        parameters = default_params.merge(input: inputs).deep_merge(params)

        if block_given?
          parameters[:stream] = proc do |chunk, _event|
            raise StreamError, chunk if chunk['type'] == 'error'

            yield chunk['delta'] if chunk['type'] == 'response.output_text.delta'
          end
        end

        begin
          response_client.create(parameters:)
        rescue StreamError, Faraday::BadRequestError => e
          error = e.is_a?(StreamError) ? e.chunk['error'] : e.response_body['error']
          message = error['message']

          raise TooManyImagesError if message.include?('Too many images')
          raise UnsupportedAttachmentError if error['code'] == 'unsupported_file'

          raise
        rescue Faraday::TooManyRequestsError => e
          if retries.positive?
            sleep(rand(20..40))
            retries -= 1
            retry
          else
            ErrorReporter.report_msg(
              'API request to Azure OpenAI failed',
              extra: { response: e.response }
            )

            raise TooManyRequestsError
          end
        end
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

      def format_message(msg)
        {
          role: msg.role,
          content: msg.inputs.map { |input| format_input(input) }
        }
      end

      def format_input(input)
        case input
        in String then format_text(input)
        in Files::File if input.image? then format_image(input)
        in Files::File then format_file(input)
        else raise ArgumentError, <<~MSG.squish
          Unsupported content type: #{input.class}.
          Must be String or Files::File."
        MSG
        end
      end

      # @param file [Files::File]
      def format_file(file)
        # We use the PDF preview for non-PDF files because Azure OpenAI currently only
        # supports PDFs as file inputs.
        file_content = if file.mime_type == 'application/pdf'
          file.content.read
        elsif file.preview.nil? || file.preview.status == 'failed'
          raise UnsupportedAttachmentError, file.mime_type
        elsif file.preview.status == 'pending'
          raise PreviewPendingError
        else
          file.preview.content.read
        end

        encoded = Base64.strict_encode64(file_content)
        mime_type = 'application/pdf'

        {
          type: 'input_file',
          filename: file.name,
          file_data: "data:#{mime_type};base64,#{encoded}"
        }
      end

      def format_image(file)
        if file.mime_type.not_in?(SUPPORTED_IMAGE_TYPES)
          raise UnsupportedAttachmentError, file.mime_type
        end

        encoded = Base64.strict_encode64(file.content.read)

        {
          type: 'input_image',
          image_url: "data:#{file.mime_type};base64,#{encoded}"
        }
      end

      def format_text(text)
        { type: 'input_text', text: text }
      end

      class StreamError < StandardError
        attr_reader :chunk

        # Example of an error chunk:
        # {
        #   "type" => "error",
        #   "sequence_number" => 2,
        #   "error" => {
        #     "type" => nil,
        #     "code" => "BadRequest",
        #     "message" => "Too many images in the request. The maximum is 50.",
        #     "param" => nil
        #   }
        # }
        def initialize(chunk)
          @chunk = chunk
          message = chunk.dig('error', 'message')
          super(message || chunk.to_s)
        end
      end
    end
  end
end
