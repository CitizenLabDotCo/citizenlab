# frozen_string_literal: true

module Callable
  ## Callable::ClassMethods
  #
  module ClassMethods
    def call(*args)
      begin
        callable_instance = new(*args)
        callable_instance.instance_variable_set(:@result, Callable::Result.new)
        callable_instance.send(_call_alias)
      rescue _error_class => e
        callable_instance.result.error = e
      end

      callable_instance.result
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

      @_call_alias = call_alias
      alias_method(@_call_alias, :call)
      singleton_class.send(:alias_method, @_call_alias, :call)
      delegate :_call_alias, to: :class
    end

    public

    def _error_class
      @_error_class || superclass.try(:_error_class) || DEFAULT_ERROR_CLASS
    end

    def _default_error_message
      @_default_error_message || superclass._default_error_message
    end

    def _call_method_name
      @_call_alias || superclass.try(:_call_alias) || :call
    end
  end
end
