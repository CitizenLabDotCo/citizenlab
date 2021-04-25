# frozen_string_literal: true

module Callable
  ## Callable::ClassMethods
  #
  module ClassMethods
    def call(*args)
      begin
        callable = new(*args)
        callable._call
      rescue _error_class => e
        callable.result.error = e
      end

      callable.result
    end

    private

    def callable_with(with = :call, error_class: DEFAULT_ERROR_CLASS, default_error: DEFAULT_ERROR_MESSAGE)
      define_call_alias(with) unless with == :call
      callable_error(error_class, default_error)
    end

    def callable_error(error_class = DEFAULT_ERROR_CLASS, default_error = DEFAULT_ERROR_MESSAGE)
      @_error_class = error_class
      @_default_error_message = default_error
      delegate :_error_class, :_default_error_message, to: :class
    end

    def define_call_alias(call_alias)
      return unless call_alias

      define_method(:call_alias) { call_alias }
      singleton_class.alias_method(call_alias, :call)
    end

    public

    def _error_class
      @_error_class || superclass.try(:_error_class) || DEFAULT_ERROR_CLASS
    end

    def _default_error_message
      @_default_error_message || superclass._default_error_message
    end
  end
end
