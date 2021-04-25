# frozen_string_literal: true

module Callable
  ## Callable::ClassMethods
  #
  module ClassMethods
    def call(*args)
      begin
        callable = new(*args)
        callable._call
      rescue error_class => e
        callable.result.error = e
      end

      callable.result
    end

    def error_class
      respond_to?(:_error_class) ? _error_class : DEFAULT_ERROR_CLASS
    end

    private

    def callable_with(with = :call, error_class: DEFAULT_ERROR_CLASS, default_error: DEFAULT_ERROR_MESSAGE)
      define_call_alias(with) unless with == :call
      callable_error(error_class, default_error)
    end

    def callable_error(error_class = DEFAULT_ERROR_CLASS, default_error = DEFAULT_ERROR_MESSAGE)
      define_singleton_method(:_error_class) { error_class }
      define_method(:error_class) { error_class }
      define_method(:default_error_message) { default_error }
    end

    def define_call_alias(call_alias)
      return unless call_alias

      define_method(:call_alias) { call_alias }
      singleton_class.alias_method(call_alias, :call)
    end
  end
end
