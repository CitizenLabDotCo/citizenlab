# frozen_string_literal: true

class SurveyResultsGeneratorService < FieldVisitorService
  def initialize(phase)
    super()
    form = phase.custom_form || CustomForm.new(participation_context: phase)
    @fields = IdeaCustomFieldsService.new(form).enabled_fields # It would be nice if we could use reportable_fields instead
    @inputs = phase.ideas.published
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
    visit_select_base(field, values)
  end

  def visit_multiselect(field)
    flattened_values = inputs.select(:id, "jsonb_array_elements(custom_field_values->'#{field.key}') as value")
    visit_select_base(field, flattened_values)
  end

  def visit_multiselect_image(field)
    visit_multiselect(field)
  end

  def visit_multiline_text(field)
    answers = inputs
      .select("custom_field_values->'#{field.key}' as value")
      .where("custom_field_values->'#{field.key}' IS NOT NULL")
      .map do |answer|
        { answer: answer.value }
      end
    answer_count = answers.size
    {
      inputType: field.input_type,
      question: field.title_multiloc,
      required: field.required,
      totalResponses: answer_count,
      customFieldId: field.id,
      textResponses: answers
    }
  end

  def visit_text(field)
    answers = inputs
      .select("custom_field_values->'#{field.key}' as value")
      .where("custom_field_values->'#{field.key}' IS NOT NULL")
      .map do |answer|
        { answer: answer.value }
      end
    answer_count = answers.size
    {
      inputType: field.input_type,
      question: field.title_multiloc,
      required: field.required,
      totalResponses: answer_count,
      customFieldId: field.id,
      textResponses: answers
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

  def visit_file_upload(field)
    # GEt all the ideas from custom fields then grab all the files in one go for that field
    files = inputs.map do |input|
      { file: input.idea_files.map { |file| file.file.url } }
    end
    answer_count = files.size
    value = {
      inputType: field.input_type,
      question: field.title_multiloc,
      required: field.required,
      totalResponses: answer_count,
      customFieldId: field.id,
      files: files
    }
    binding.pry
    value
  end

  private

  attr_reader :fields, :inputs, :locales

  def visit_select_base(field, values)
    option_keys = field.options.pluck(:key)
    distribution = Idea.select(:value).from(values).group(:value).order(Arel.sql('COUNT(value) DESC')).count.to_a
    sorted_distribution = distribution.sort_by { |k, _v| k == 'other' ? 1 : 0 } # other should always be last
    filtered_distribution = sorted_distribution.select { |(value, _count)| option_keys.include? value }
    option_titles = field.options.each_with_object({}) do |option, accu|
      accu[option.key] = option.title_multiloc
    end
    option_images = []
    if field.support_option_images?
      option_images = field.options.each_with_object({}) do |option, accu|
        accu[option.key] = option.image&.image&.versions&.transform_values(&:url)
      end
    end
    collect_answers(field, filtered_distribution, option_titles, option_images)
  end

  def collect_answers(field, distribution, option_titles, option_images = [])
    answers = distribution.map do |(value, count)|
      option = { answer: option_titles[value], responses: count }
      option[:image] = option_images[value] if option_images.present?
      option
    end
    answer_count = distribution.sum { |(_value, count)| count }
    answers = {
      inputType: field.input_type,
      question: field.title_multiloc,
      required: field.required,
      totalResponses: answer_count,
      answers: answers,
      customFieldId: field.id
    }
    answers[:textResponses] = collect_other_text_responses(field) if field.other_option_text_field
    answers
  end

  def collect_other_text_responses(field)
    inputs
      .select("custom_field_values->'#{field.key}_other' as value")
      .where("custom_field_values->'#{field.key}_other' IS NOT NULL")
      .map do |answer|
        { answer: answer.value }
      end
  end
end
