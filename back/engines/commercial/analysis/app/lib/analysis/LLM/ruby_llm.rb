module Analysis
  module LLM
    class RubyLLM < Base
      delegate :context_window, to: :model_info

      def chat(prompt, **params)
        chat = chat_context.chat(model:, **chat_options)

        response = chat.ask(prompt, **params)
        response.content
      end

      def chat_async(prompt, **params)
        chat = chat_context.chat(model)

        chat.ask(prompt, **params) do |chunk|
          yield(chunk.content)
        end
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
