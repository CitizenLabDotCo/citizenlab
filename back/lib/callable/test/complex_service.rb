module Callable
  module Test
    class ComplexService
      include Callable

      ComplexError = Class.new(StandardError)

      callable_with :test, error_class: ComplexError

      def test
        result.log_result = 'it works'
      end

      class ChildService < ComplexService
        def test
          result.log_result = 'it works'
        end
      end
    end
  end
end
