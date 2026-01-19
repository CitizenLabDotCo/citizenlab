module Analysis
  module LLM
    class RubyLLM < Base
      def chat(prompt, **params)
        chat = chat_context.chat(model:, **chat_options)

        if params[:response_schema]
          chat = chat.with_schema(params[:response_schema])
        end

        response = chat.ask(prompt, **params.except(:response_schema))
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
    end
  end
end
