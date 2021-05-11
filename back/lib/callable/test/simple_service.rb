module Callable
  module Test
    class SimpleService
      include Callable

      def call
        result.log_result = 'it works'
      end
    end
  end
end
