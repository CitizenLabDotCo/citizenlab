# frozen_string_literal: true

class SurveyResultsGeneratorService < FieldVisitorService
  def initialize(participation_context)
    super()
    form = participation_context.custom_form || CustomForm.new(participation_context: participation_context)
    @fields = IdeaCustomFieldsService.new(form).reportable_fields
    @inputs = participation_context.ideas
    @locales = AppConfiguration.instance.settings('core', 'locales')
  end

  def generate_submission_count
    { data: { totalSubmissions: inputs.size } }
  end

  def generate_results
    results = fields.filter_map do |field|
      visit field
    end
    {
      data: {
        results: results,
        totalSubmissions: inputs.size
      }
    }
  end

  def visit_multiselect(field)
    flattened_values = inputs.select(:id, "jsonb_array_elements(custom_field_values->'#{field.key}') as value")
    distribution = Idea.select(:value).from(flattened_values).group(:value).order(Arel.sql('COUNT(value) DESC')).count.to_a
    option_titles = field.options.each_with_object({}) do |option, accu|
      accu[option.key] = option.title_multiloc
    end
    collect_answers(field, distribution, option_titles)
  end

  def visit_linear_scale(field)
    values = inputs
      .select("custom_field_values->'#{field.key}' as value")
      .where("custom_field_values->'#{field.key}' IS NOT NULL")
    distribution = Idea.select(:value).from(values).group(:value).order(Arel.sql('COUNT(value) DESC')).count.to_a
    option_titles = (2...field.maximum).index_with do |value|
      locales.index_with { |_locale| value.to_s }
    end
    option_titles[1] = field.minimum_label_multiloc
    option_titles[field.maximum] = field.maximum_label_multiloc
    collect_answers(field, distribution, option_titles)
  end

  private

  attr_reader :fields, :inputs, :locales

  def collect_answers(field, distribution, option_titles)
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
end
