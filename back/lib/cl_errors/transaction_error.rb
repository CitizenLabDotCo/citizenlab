# frozen_string_literal: true

module ClErrors
  class TransactionError < StandardError
    def initialize(options = {})
      super
      @error_key = options.fetch(:error_key, nil)
      @code = options.fetch(:code, 422)
    end

    attr_reader :error_key, :code
  end
end
