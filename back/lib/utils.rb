# frozen_string_literal: true

class Utils
  class << self
    # @return [Boolean]
    def to_bool(value)
      if [true, 'TRUE', 'true', '1', 1].include?(value)
        true
      elsif [false, 'FALSE', 'false', '0', 0].include?(value)
        false
      else
        raise ArgumentError
      end
    end

    def to_number(value)
      if value.is_a? Numeric
        value
      else
        Integer(value)
      end
    rescue ArgumentError
      Float(value)
    end
  end
end
