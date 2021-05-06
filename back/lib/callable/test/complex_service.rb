module Callable
  module Test
    class ComplexService
      include Callable

      ComplexError = Class.new(StandardError)

      callable_with :test, error_class: ComplexError

      def test
        result.log_result = 'it works'
      end
      class ChildService < ComplexService; end

      class FailedService < ComplexService
        def test
          raise_error 'something went wrong'
        end
      end
    end
  end
end
