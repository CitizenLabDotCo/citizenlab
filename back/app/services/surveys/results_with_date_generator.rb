# frozen_string_literal: true

module Surveys
  class ResultsWithDateGenerator < ResultsGenerator
    def initialize(phase, structure_by_category: false, year: nil, quarter: nil)
      super(phase, structure_by_category: structure_by_category)
      @year = year&.to_i
      @quarter = quarter&.to_i
      filter_inputs_by_quarter
    end

    private

    def filter_inputs_by_quarter
      return unless @year && @quarter

      raise ArgumentError, 'Invalid date format' unless valid_quarter?

      @inputs = @inputs.where(created_at: quarter_to_date_range(@year, @quarter))
    end

    def add_averages(results)
      return super unless @year && @quarter

      # Get the averages by quarter
      averages = AverageGenerator.new(phase).field_averages_by_quarter

      # Merge the averages into the main results
      results.each do |result|
        quarter_values = averages[result[:customFieldId]]
        if quarter_values
          result[:averages] = {
            this_period: quarter_values[format_quarter(@year, @quarter)],
            last_period: quarter_values[previous_quarter(@year, @quarter)]
          }
        end
      end
    end

    def quarter_to_date_range(year, quarter)
      case quarter
      when 1
        start_date = Date.new(year, 1, 1)
        end_date = Date.new(year, 3, 31)
      when 2
        start_date = Date.new(year, 4, 1)
        end_date = Date.new(year, 6, 30)
      when 3
        start_date = Date.new(year, 7, 1)
        end_date = Date.new(year, 9, 30)
      when 4
        start_date = Date.new(year, 10, 1)
        end_date = Date.new(year, 12, 31)
      else
        raise ArgumentError, 'Invalid quarter format'
      end

      start_date..end_date
    end

    def format_quarter(year, quarter)
      "#{year}-#{quarter}"
    end

    def previous_quarter(year, quarter)
      if quarter == 1
        year -= 1
        quarter = 4
      else
        quarter -= 1
      end
      format_quarter(year, quarter)
    end

    def valid_quarter?
      (2024..2050).cover?(@year) && (1..4).cover?(@quarter)
    end
  end
end
