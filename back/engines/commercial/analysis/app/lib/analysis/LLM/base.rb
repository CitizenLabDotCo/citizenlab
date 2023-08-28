# frozen_string_literal: true

module Analysis
  module LLM
    class Base
      def name
        self.class.name.demodulize.underscore
      end

      def context_window
        raise NotImplementedError
      end

      # Float in 0..1 that denotes how relatively accurate the llm is. 1 would
      # be perfect accuracy.
      def accuracy
        raise NotImplementedError
      end

      def chat(prompt, **params)
        raise NotImplementedError
      end

      def chat_async(prompt, **params)
        raise NotImplementedError
      end

      def enabled?
        true
      end
    end
  end
end
