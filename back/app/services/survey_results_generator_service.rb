# frozen_string_literal: true

class SurveyResultsGeneratorService < FieldVisitorService
  def initialize(participation_context)
    super()
    form = participation_context.custom_form || CustomForm.new(participation_context: participation_context)
    @fields = IdeaCustomFieldsService.new(form).enabled_fields # It would be nice if we could use reportable_fields instead
    @inputs = participation_context.ideas
    @locales = AppConfiguration.instance.settings('core', 'locales')
  end

  def generate_submission_count
    { totalSubmissions: inputs.size }
  end

  def generate_results
    results = fields.filter_map do |field|
      visit field
    end
    {
      results: results,
      totalSubmissions: inputs.size
    }
  end

  def visit_select(field)
    values = inputs
      .select("custom_field_values->'#{field.key}' as value")
      .where("custom_field_values->'#{field.key}' IS NOT NULL")
    distribution = Idea.select(:value).from(values).group(:value).order(Arel.sql('COUNT(value) DESC')).count.to_a
    filtered_distribution = distribution.select { |(value, _count)| option_keys.values.include? ( value ) }
    option_titles = field.options.each_with_object({}) do |option, accu|
      accu[option.key] = option.title_multiloc
    end
    collect_answers(field, filtered_distribution, option_titles)
  end

  def visit_multiselect(field)
    option_keys = field.options.each_with_object({}) do |option, accu|
      accu[option.key] = option.key
    end
    flattened_values = inputs.select(:id, "jsonb_array_elements(custom_field_values->'#{field.key}') as value")
    distribution = Idea.select(:value).from(flattened_values).group(:value).order(Arel.sql('COUNT(value) DESC')).count.to_a
    filtered_distribution = distribution.select { |(value, _count)| option_keys.values.include? ( value ) }
    option_titles = field.options.each_with_object({}) do |option, accu|
      accu[option.key] = option.title_multiloc
    end
    collect_answers(field, filtered_distribution, option_titles)
  end

  def visit_multiline_text(field)
    answers = inputs
      .select("custom_field_values->'#{field.key}' as value")
      .where("custom_field_values->'#{field.key}' IS NOT NULL")
      .map(&:value)
    answer_count = answers.size
    {
      inputType: field.input_type,
      question: field.title_multiloc,
      required: field.required,
      totalResponses: answer_count,
      customFieldId: field.id
    }
  end

  def visit_text(field)
    answers = inputs
      .select("custom_field_values->'#{field.key}' as value")
      .where("custom_field_values->'#{field.key}' IS NOT NULL")
      .map(&:value)
    answer_count = answers.size
    {
      inputType: field.input_type,
      question: field.title_multiloc,
      required: field.required,
      totalResponses: answer_count,
      customFieldId: field.id
    }
  end

  def visit_linear_scale(field)
    values = inputs
      .select("custom_field_values->'#{field.key}' as value")
      .where("custom_field_values->'#{field.key}' IS NOT NULL")
    distribution_from_db = Idea.select(:value).from(values).group(:value).order(value: :desc).count.to_h
    distribution = []
    (1..field.maximum).reverse_each do |value|
      distribution << [value, distribution_from_db[value] || 0]
    end
    option_titles = (1..field.maximum).index_with do |value|
      locales.index_with { |_locale| value.to_s }
    end
    minimum_labels = field.minimum_label_multiloc.transform_values do |label|
      label.present? ? "1 - #{label}" : '1'
    end
    option_titles[1].merge! minimum_labels
    maximum_labels = field.maximum_label_multiloc.transform_values do |label|
      label.present? ? "#{field.maximum} - #{label}" : field.maximum.to_s
    end
    option_titles[field.maximum].merge! maximum_labels
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
      required: field.required,
      totalResponses: answer_count,
      answers: answers,
      customFieldId: field.id
    }
  end
end
