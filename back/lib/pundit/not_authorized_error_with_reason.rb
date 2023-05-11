# frozen_string_literal: true

module Pundit
  # This is essentially the same as Pundit::NotAuthorizedError, but with a "reason".
  #
  # It is used to provide a custom error message to the client by raising this error in
  # for instance in a policy class. `Pundit::NotAuthorizedError` errors are rescued by
  # the ApplicationController, which renders an error response that includes the reason
  # (if any).
  class NotAuthorizedErrorWithReason < NotAuthorizedError
    attr_reader :reason

    def initialize(options = {})
      super(options)
      @reason = options[:reason] unless options.is_a?(String)
    end
  end
end
