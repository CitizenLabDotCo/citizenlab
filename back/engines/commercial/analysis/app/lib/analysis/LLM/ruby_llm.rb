module Analysis
  module LLM
    class RubyLLM < Base
      # @param prompt [String, Analysis::LLM::Message]
      def chat(prompt, **params)
        text, file_paths = extract_text_and_files(prompt)

        chat = chat_context.chat(model:, **chat_options)

        if params[:response_schema]
          chat = chat.with_schema(params[:response_schema])
        end

        ask_params = params.except(:response_schema)
        ask_params[:with] = file_paths if file_paths.present?

        response = chat.ask(text, **ask_params)
        response.content
      end

      # @param prompt [String, Analysis::LLM::Message]
      def chat_async(prompt, **params)
        text, file_paths = extract_text_and_files(prompt)

        chat = chat_context.chat(model:, **chat_options)

        ask_params = params.dup
        ask_params[:with] = file_paths if file_paths.present?

        chat.ask(text, **ask_params) do |chunk|
          yield(chunk.content)
        end
      end

      def context_window
        chat_context.chat(model:, **chat_options).model.context_window
      end

      # The model ID as returned by RubyLLM.models.chat_models
      def model
        raise NotImplementedError
      end

      def accuracy
        0.7
      end

      # Override in subclass to provide a specific RubyLLM context configuration for this model
      # See https://rubyllm.com/configuration/#contexts-isolated-configurations
      def chat_context
        ::RubyLLM
      end

      # Override in subclass to provide options to RubyLLM.chat
      def chat_options
        {}
      end

      private

      def extract_text_and_files(prompt)
        return [prompt, []] if prompt.is_a?(String)

        message = Message.wrap(prompt)
        texts = []
        file_paths = []

        message.inputs.each do |input|
          case input
          when String
            texts << input
          when Files::File
            file_paths << file_to_tempfile(input)
          else
            raise ArgumentError, "Unsupported content type: #{input.class}. Must be String or Files::File."
          end
        end

        [texts.join("\n"), file_paths]
      end

      def file_to_tempfile(file)
        file_content = if file.mime_type == 'application/pdf' || file.image?
          file.content.read
        elsif file.preview.nil? || file.preview.status == 'failed'
          raise UnsupportedAttachmentError, file.mime_type
        elsif file.preview.status == 'pending'
          raise PreviewPendingError
        else
          file.preview.content.read
        end

        ext = ::File.extname(file.name).presence || '.bin'
        tempfile = Tempfile.new(['llm_attachment', ext])
        tempfile.binmode
        tempfile.write(file_content)
        tempfile.close
        tempfile.path
      end
    end
  end
end
