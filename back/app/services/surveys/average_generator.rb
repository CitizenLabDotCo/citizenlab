# frozen_string_literal: true

module Surveys
  class AverageGenerator
    def initialize(phase, input_type: nil)
      form = phase.custom_form || CustomForm.new(participation_context: phase)
      @fields = IdeaCustomFieldsService.new(form).enabled_fields.select do |f|
        f.input_type == input_type || f.supports_average? # Defaults to returning all fields that support averages
      end
      @inputs = phase.ideas.supports_survey.published.includes(:author)
      @phase = phase
    end

    # Default is to get the averages by custom field ID but can calculate on any attribute
    def field_averages(answers: all_answers, custom_field_attribute: :id)
      @fields.to_h { |f| [f[custom_field_attribute], calculate_average(answers.pluck(f.key))] }
    end

    def field_averages_by_quarter(custom_field_attribute: :id)
      grouped_answers = all_answers.group_by { |a| a['quarter'] }
      averages = grouped_answers.transform_values do |answers|
        field_averages(answers:, custom_field_attribute:)
      end
      averages = order_by_quarter(averages)
      switch_keys(averages)
    end

    def summary_averages_by_quarter
      averages = {
        overall: {
          averages: overall_average_by_quarter,
          totals: totals_by_quarter
        }
      }
      if @phase.pmethod.supports_custom_field_categories?
        averages[:categories] = {
          averages: category_averages_by_quarter,
          multilocs: CustomField::QUESTION_CATEGORIES.index_with do |category|
            MultilocService.new.i18n_to_multiloc("custom_fields.community_monitor.question_categories.#{category}")
          end
        }
      end
      averages
    end

    private

    # This is an average of averages - or should it take the average of all values
    def overall_average_by_quarter
      grouped_answers = all_answers.group_by { |a| a['quarter'] }
      averages = grouped_answers.transform_values do |answers|
        field_averages = field_averages(answers:)
        calculate_average(field_averages.values)
      end
      order_by_quarter(averages)
    end

    def category_averages_by_quarter
      averages = field_averages_by_quarter(custom_field_attribute: :question_category)
      CustomField::QUESTION_CATEGORIES.each { |c| averages[c] ||= {} } # Add in any missing categories
      averages
    end

    def totals_by_quarter
      field_keys = @fields.pluck(:key)
      grouped_answers = all_answers.group_by { |a| a['quarter'] }
      totals = grouped_answers.transform_values do |answers|
        answers.each_with_object({}) do |answer, accu|
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
    def all_answers
      @all_answers ||= @inputs.flat_map do |input|
        input.custom_field_values
          .merge({ 'quarter' => date_to_quarter(input.created_at) })
          .merge(input.author.custom_field_values)
      end
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
