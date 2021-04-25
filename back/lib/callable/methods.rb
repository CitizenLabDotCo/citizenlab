module Callable
  module Methods
    def result
      @result ||= Callable::Result.new
    end

    def _call
      respond_to?(:call_alias) ? send(call_alias) : call
    end

    private

    ## The instance api method that should be used for logic
    def call
      raise_error 'Caller method not overriden.'
    end

    protected

    def raise_error(message)
      raise error_class, message || default_error_message
    end
  end
end
