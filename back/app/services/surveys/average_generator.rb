# frozen_string_literal: true

module Surveys
  class AverageGenerator
    def initialize(phase, input_type: nil)
      form = phase.custom_form || CustomForm.new(participation_context: phase)
      @fields = IdeaCustomFieldsService.new(form).enabled_fields.select do |f|
        f.input_type == input_type || f.supports_average? # Defaults to returning all fields that support averages
      end
      @inputs = phase.ideas.native_survey.published
    end

    def field_averages_by_quarter
      grouped_answers = all_answers.group_by { |a| a['quarter'] }
      averages = grouped_answers.transform_values do |answers|
        averages_by_field(answers)
      end
      switch_keys(averages)
    end

    # This is an average of averages - or should it take the average of all values
    def overall_average_by_quarter
      # binding.pry
      grouped_answers = all_answers.group_by { |a| a['quarter'] }
      grouped_answers.transform_values do |answers|
        field_averages = averages_by_field(answers)
        calculate_average(field_averages.values)
      end
    end

    # Placeholder for now
    def category_averages_by_quarter
      {
        'category' => { '2025-2' => 3.4, '2025-1' => 3.1 },
        'category2' => { '2025-2' => 3.4, '2025-1' => 3.1 }
      }
    end

    private

    # Generate a flat object for each response including additional attributes
    def all_answers
      @inputs.flat_map do |input|
        input.custom_field_values
          .merge({ 'quarter' => date_to_quarter(input.created_at) })
          .merge(input.author.custom_field_values)
      end
    end

    def averages_by_field(answers)
      @fields.to_h { |f| [f.id, calculate_average(answers.pluck(f.key))] }
    end

    def calculate_average(values)
      values = values.compact # Remove any nils
      total = values.sum { |a| a || 0 }
      count = values.count
      count > 0 ? (total.to_f / values.count).round(1) : 0.0
    end

    def switch_keys(hash)
      converted_hash = {}
      hash.each do |key, fields|
        fields.each do |field_id, value|
          converted_hash[field_id] ||= {}
          converted_hash[field_id][key] = value
        end
      end
      converted_hash
    end

    def date_to_quarter(date)
      year = date.year
      quarter = case date.month
      when 1..3 then '1'
      when 4..6 then '2'
      when 7..9 then '3'
      when 10..12 then '4'
      end
      "#{year}-#{quarter}"
    end
  end
end
