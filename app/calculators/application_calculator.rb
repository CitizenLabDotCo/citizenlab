class ApplicationCalculator
  include Callable

  CalculationError = Class.new(Callable::Error)

  callable_with :calculate, error_class: CalculationError, default_error: 'Could not perform calculation'
end
