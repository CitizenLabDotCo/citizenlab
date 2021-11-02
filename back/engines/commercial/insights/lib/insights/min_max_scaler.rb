# frozen_string_literal: true

module Insights
  class MinMaxScaler
    # Example:
    #   MinMaxScaler.new([0.2, 7], [1, 5])
    def initialize(input_range, output_range)
      @actual_min, @actual_max = input_range
      @min, @max = output_range
    end

    def transform(value)
      value = value.to_f
      value = (value - @actual_min) / (@actual_max - @actual_min) # scales to [0, 1]
      value * (@max - @min) + @min # scales to [@min, @max]
    end
  end
end
