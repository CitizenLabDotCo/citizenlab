# frozen_string_literal: true

module InputStrategy
  class Base
    def initialize(custom_field)
      @custom_field = custom_field
    end

    def supports_average?
      false
    end

    def supports_options?
      false
    end

    def supports_other_option?
      false
    end

    def supports_option_images?
      false
    end

    def supports_follow_up?
      false
    end

    protected

    attr_reader :custom_field
  end
end
