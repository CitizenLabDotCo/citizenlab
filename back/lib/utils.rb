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

    def boolean?(value)
      [true, false].include? value
    end

    # NOTE: Copied from nori gem as orginally it was a monkey patch in a dependency of a dependency which was then removed
    # @param inputstring [String] The string to be converted to snake case.
    # @return [String] A copy of the input string converted to snake case.
    def snakecase(inputstring)
      str = inputstring.dup
      str.gsub!('::', '/')
      str.gsub!(/([A-Z]+)([A-Z][a-z])/, '\1_\2')
      str.gsub!(/([a-z\d])([A-Z])/, '\1_\2')
      str.tr!('.', '_')
      str.tr!('-', '_')
      str.downcase!
      str
    end
  end
end
