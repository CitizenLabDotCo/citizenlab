# frozen_string_literal: true

module InputStrategy
  class Base
    def initialize(custom_field)
      @custom_field = custom_field
    end

    def supports_average?
      false
    end

    protected

    attr_reader :custom_field
  end
end
