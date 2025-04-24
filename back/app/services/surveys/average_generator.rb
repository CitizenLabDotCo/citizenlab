# frozen_string_literal: true

module Surveys
  class AverageGenerator
    def initialize(phase, input_type: nil)
      form = phase.custom_form || CustomForm.new(participation_context: phase)
      @fields = IdeaCustomFieldsService.new(form).enabled_fields.select do |f|
        input_type ? f.input_type == input_type : f.supports_average? # Defaults to returning all fields that support averages
      end
      @inputs = phase.ideas.supports_survey.published
      @phase = phase
    end

    # Averages for all fields by id
    def field_averages(answers: all_answers)
      @fields.to_h { |f| [f[:id], calculate_average(answers.pluck(f.key))] }
    end

    def field_averages_by_quarter
      grouped_answers = all_answers.group_by { |a| a['quarter'] }
      averages = grouped_answers.transform_values do |answers|
        field_averages(answers: answers)
      end
      averages = order_by_quarter(averages)
      switch_keys(averages)
    end

    def summary_averages_by_quarter
      {
        overall: {
          averages: overall_average_by_quarter,
          totals: totals_by_quarter
        },
        categories: {
          averages: category_averages_by_quarter,
          multilocs: category_multilocs
        }
      }
    end

    private

    def overall_average_by_quarter
      grouped_answers = all_answers.group_by { |a| a['quarter'] }
      averages = grouped_answers.transform_values do |answers|
        key_group = @fields.pluck(:key)
        average_for_field_keys(key_group, answers)
      end
      order_by_quarter(averages)
    end

    def category_averages_by_quarter
      return {} unless @phase.pmethod.supports_custom_field_categories?

      grouped_answers = all_answers.group_by { |a| a['quarter'] }
      averages = grouped_answers.transform_values do |answers|
        field_group_averages(answers, 'question_category')
      end
      averages = order_by_quarter(averages)
      averages = switch_keys(averages)
      averages['other'] = averages.delete(nil) if averages.key?(nil) # NOTE: custom_field model should return 'other' but does not

      CustomField::QUESTION_CATEGORIES.each { |c| averages[c] ||= {} } # Add in any missing categories
      averages
    end

    def category_multilocs
      return {} unless @phase.pmethod.supports_custom_field_categories?

      CustomField::QUESTION_CATEGORIES.index_with do |category|
        MultilocService.new.i18n_to_multiloc("custom_fields.community_monitor.question_categories.#{category}")
      end
    end

    # Calculate the averages for groups of custom fields - grouped by custom field attribute
    def field_group_averages(answers, custom_field_attribute)
      # Get an array of keys grouped by attribute
      key_group = @fields.group_by { |item| item[custom_field_attribute] }.map do |attribute, items|
        { attribute: attribute, keys: items.map { |item| item[:key] } } # TODO: item?
      end

      key_group.to_h do |group|
        [group[:attribute], average_for_field_keys(group[:keys], answers)]
      end
    end

    def average_for_field_keys(keys, answers)
      values = answers.flat_map { |answer| answer.select { |key, _| keys.include?(key) }.values }
      calculate_average(values)
    end

    def totals_by_quarter
      maximum_value = @fields.pluck(:maximum).compact.max
      return {} unless maximum_value # No maximum value means no totals

      field_keys = @fields.pluck(:key)
      grouped_answers = all_answers.group_by { |a| a['quarter'] }
      totals = grouped_answers.transform_values do |answers|
        empty_values = (1..maximum_value).index_with { |_i| 0 } # Create empty values
        answers.each_with_object(empty_values) do |answer, accu|
          answer.each do |key, value|
            next unless field_keys.include?(key)

            accu[value] ||= 0
            accu[value] += 1
          end
        end
      end
      order_by_quarter(totals)
    end

    # Generate a flat object for each response including additional attributes
    # Can add user fields and demographics in here when needed
    def all_answers
      @all_answers ||= @inputs.flat_map do |input|
        input.custom_field_values
          .merge({ 'quarter' => date_to_quarter(input.created_at) })
      end
    end

    def calculate_average(values)
      values = values.compact # Remove any nils
      total = values.sum { |a| a || 0 }
      count = values.count
      count > 0 ? (total.to_f / values.count).round(1) : 0.0
    end

    def switch_keys(hash)
      hash.each_with_object({}) do |(key, fields), converted_hash|
        fields.each do |field_id, value|
          converted_hash[field_id] ||= {}
          converted_hash[field_id][key] = value
        end
      end
    end

    def order_by_quarter(averages)
      averages.sort_by { |k, _| -k }.to_h # Sort by earliest quarter first
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
