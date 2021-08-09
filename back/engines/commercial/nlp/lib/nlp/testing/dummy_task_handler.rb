# frozen_string_literal: true

module NLP
  module Testing
    # This dummy handler class is used for test purposes.
    class DummyTaskHandler
      def handle(_task, _result)
        # does nothing
      end
    end
  end
end
