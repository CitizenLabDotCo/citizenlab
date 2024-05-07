# frozen_string_literal: true

module BulkImportIdeas
  class Error < StandardError
    def initialize(key, params = {})
      super()
      @key = key
      @params = params
    end

    def to_s
      "#{key}##{@params.to_json}"
    end

    attr_reader :key, :params
  end
end
