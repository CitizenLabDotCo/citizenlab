# frozen_string_literal: true

module Surveys
  class LinearScaleScoreGenerator
    def initialize(phase)
      @phase = phase
      form = @phase.custom_form || CustomForm.new(participation_context: phase)
      @fields = IdeaCustomFieldsService.new(form).enabled_linear_scale_fields
      @inputs = @phase.ideas.native_survey.published
    end

    def field_scores_by_quarter
      grouped_answers = all_answers.group_by { |a| a['quarter'] }
      averages = grouped_answers.transform_values do |answers|
        averages_for_all_fields(answers)
      end
      switch_keys(averages)
    end

    def overall_score_by_quarter
      # TODO
    end

    private

    # Generate a flat object for each response including additional attributes
    # In Koen's new model, would we create a virtual field for date to add into the values?
    def all_answers
      @inputs.flat_map do |input|
        input.custom_field_values
          .merge({ 'quarter' => date_to_quarter(input.created_at) })
          .merge(input.author.custom_field_values)
      end
    end

    def averages_for_all_fields(answers)
      @fields.to_h { |f| [f.id, calculate_linear_scale_average(answers, f.key)] }
    end

    def calculate_linear_scale_average(answers, field_key)
      values = answers.pluck(field_key).compact
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
