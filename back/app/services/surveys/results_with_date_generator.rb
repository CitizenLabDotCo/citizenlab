# frozen_string_literal: true

module Surveys
  class ResultsWithDateGenerator < ResultsGenerator
    def generate_results(year: nil, quarter: nil)
      filter_inputs_by_quarter(year, quarter) if year && quarter
      super()
    end

    private

    def add_additional_fields_to_results(results)
      add_linear_scale_scores results, @year, @quarter
    end

    def filter_inputs_by_quarter(year, quarter)
      raise ArgumentError, 'Invalid date format' unless year.match?(/^\d{4}$/) && quarter.match?(/^[1-4]$/)

      @year = year
      @quarter = quarter
      @inputs = @inputs.where(created_at: quarter_to_date_range(year, quarter))
    end

    def add_linear_scale_scores(results, year, quarter)
      averages = AverageGenerator.new(phase).field_averages_by_quarter

      # Merge the averages into the main results
      results.each do |result|
        quarter_values = averages[result[:customFieldId]]
        if quarter_values
          result[:averages] = {
            this_period: quarter_values[format_quarter(year, quarter)],
            last_period: quarter_values[previous_quarter(year, quarter)]
          }
        end
      end
    end

    def quarter_to_date_range(year, quarter)
      year = year.to_i
      quarter = quarter.to_i
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
      year = year.to_i
      quarter = quarter.to_i
      if quarter == 1
        year -= 1
        quarter = 4
      else
        quarter -= 1
      end
      format_quarter(year, quarter)
    end
  end
end
