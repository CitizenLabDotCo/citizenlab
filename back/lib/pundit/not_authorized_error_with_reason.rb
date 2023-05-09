# frozen_string_literal: true

module Pundit
  class NotAuthorizedErrorWithReason < NotAuthorizedError
    attr_reader :reason

    def initialize(options = {})
      super(options)
      @reason = options[:reason] unless options.is_a?(String)
    end
  end
end
