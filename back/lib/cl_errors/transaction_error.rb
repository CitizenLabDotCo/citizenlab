module ClErrors
  class TransactionError < StandardError

    def initialize(options={})
      super
  	  @error_key = options.fetch(:error_key, nil)
  	  @code = options.fetch(:code, 422)
  	end

  	def error_key
  	  @error_key
  	end

  	def code
  	  @code
  	end

  end
end