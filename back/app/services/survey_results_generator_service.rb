# frozen_string_literal: true

class SurveyResultsGeneratorService < FieldVisitorService
  def initialize(participation_context)
    super()
    form = participation_context.custom_form || CustomForm.new(participation_context: participation_context)
    @fields = IdeaCustomFieldsService.new(form).reportable_fields
    @inputs = participation_context.ideas
  end

  def generate
    results = fields.filter_map do |field|
      visit field
    end
    {
      data: { results: results },
      totalSubmissions: inputs.size
    }
  end

  def visit_multiselect(field)
    flattened_values = inputs.select(:id, "jsonb_array_elements(custom_field_values->'#{field.key}') as value")
    distribution = Idea.select(:value).from(flattened_values).group(:value).order(Arel.sql('COUNT(value) DESC')).count.to_a
    option_titles = field.options.each_with_object({}) do |option, accu|
      accu[option.key] = option.title_multiloc
    end
    answers = distribution.map do |(value, count)|
      {
        answer: option_titles[value],
        responses: count
      }
    end
    answer_count = distribution.sum { |(_value, count)| count }
    {
      inputType: field.input_type,
      question: field.title_multiloc,
      totalResponses: answer_count,
      answers: answers
    }
  end

  private

  attr_reader :fields, :inputs
end
