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

      def accuracy
        raise NotImplementedError
      end

      def enabled?
        true
      end
    end
  end
end
