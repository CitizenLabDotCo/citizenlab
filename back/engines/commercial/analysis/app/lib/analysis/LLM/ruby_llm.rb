module Analysis
  module LLM
    class RubyLLM < Base
      def chat(prompt, **params)
        text, file_paths = extract_text_and_files(prompt)

        chat = chat_context.chat(model:, **chat_options)

        if params[:response_schema]
          chat = chat.with_schema(params[:response_schema])
        end

        ask_kwargs = {}
        ask_kwargs[:with] = file_paths if file_paths.present?

        response = chat.ask(text, **ask_kwargs)
        response.content
      end

      def chat_async(prompt, **params)
        chat = chat_context.chat(model:, **chat_options)

        chat.ask(prompt, **params) do |chunk|
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

      # RubyLLM's chat.ask() only accepts a string message + file paths (via `with:`).
      # When prompt is a Message object (e.g. text + PDF), we need to separate them.
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

      # RubyLLM's `with:` param expects local file paths, not Files::File objects.
      # Writes the file content to a tempfile and returns its path.
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
