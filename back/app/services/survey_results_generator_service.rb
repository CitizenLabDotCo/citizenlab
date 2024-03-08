# frozen_string_literal: true

class SurveyResultsGeneratorService < FieldVisitorService
  def initialize(phase)
    super()
    @form = phase.custom_form || CustomForm.new(participation_context: phase)
    @fields = IdeaCustomFieldsService.new(@form).enabled_fields # It would be nice if we could use reportable_fields instead
    @inputs = phase.ideas.published
    @locales = AppConfiguration.instance.settings('core', 'locales')
  end

  def generate_submission_count
    { totalSubmissions: inputs.size }
  end

  def generate_results(field_id: nil, group_mode: nil, group_field_id: nil)
    if !field_id
      # Return all results
      results = fields.filter_map do |field|
        visit field
      end
      {
        results: results,
        totalSubmissions: inputs.size
      }
    elsif group_field_id
      # Return grouped results
      field = find_question(field_id)
      raise "Unsupported question type: #{field.input_type}" unless %w[select multiselect multiselect_image].include?(field.input_type)

      visit_select_base field, group_mode: group_mode, group_field_id: group_field_id
    else
      # Return single ungrouped result
      field = find_question(field_id)
      visit field
    end
  end

  def visit_select(field)
    visit_select_base(field)
  end

  def visit_multiselect(field)
    visit_select_base(field)
  end

  def visit_multiselect_image(field)
    visit_select_base(field)
  end

  def visit_multiline_text(field)
    answers = inputs
      .select("custom_field_values->'#{field.key}' as value")
      .where("custom_field_values->'#{field.key}' IS NOT NULL")
      .map do |answer|
        { answer: answer.value }
      end
    response_count = answers.size
    core_field_attributes(field, response_count).merge({
      textResponses: answers
    })
  end

  def visit_text(field)
    answers = inputs
      .select("custom_field_values->'#{field.key}' as value")
      .where("custom_field_values->'#{field.key}' IS NOT NULL")
      .map do |answer|
        { answer: answer.value }
      end
    response_count = answers.size
    core_field_attributes(field, response_count).merge({
      textResponses: answers
    })
  end

  def visit_linear_scale(field)
    # Construct the multiloc values
    answer_titles = (1..field.maximum).index_with do |value|
      { title_multiloc: locales.index_with { |_locale| value.to_s } }
    end
    minimum_labels = field.minimum_label_multiloc.transform_values do |label|
      label.present? ? "1 - #{label}" : '1'
    end
    answer_titles[1][:title_multiloc].merge! minimum_labels
    maximum_labels = field.maximum_label_multiloc.transform_values do |label|
      label.present? ? "#{field.maximum} - #{label}" : field.maximum.to_s
    end
    answer_titles[field.maximum][:title_multiloc].merge! maximum_labels

    field_attributes = visit_select_base field
    field_attributes[:multilocs] = { answers: answer_titles }
    field_attributes
  end

  def visit_file_upload(field)
    file_ids = inputs
      .select("custom_field_values->'#{field.key}'->'id' as value")
      .where("custom_field_values->'#{field.key}' IS NOT NULL")
      .map(&:value)
    files = IdeaFile.where(id: file_ids).map do |file|
      { name: file.name, url: file.file.url }
    end
    response_count = files.size
    core_field_attributes(field, response_count).merge({
      files: files
    })
  end

  private

  attr_reader :fields, :form, :inputs, :locales

  def core_field_attributes(field, response_count)
    {
      inputType: field.input_type,
      question: field.title_multiloc,
      customFieldId: field.id,
      required: field.required,
      grouped: false,
      totalResponseCount: @inputs.count,
      questionResponseCount: response_count
    }
  end

  def visit_select_base(field, group_mode: nil, group_field_id: nil)
    query = inputs
    if group_field_id
      if group_mode == 'user_field'
        # Single user field grouped result
        group_field = CustomField.find(group_field_id)
        query = query.joins(:author)
      else
        # Single form field grouped result
        group_field = find_question(group_field_id)
      end
      raise "Unsupported group field type: #{group_field.input_type}" unless group_field.input_type == 'select'

      query = query.select(
        select_query(field, as: 'answer'),
        select_query(group_field, as: 'group')
      )
      answers = construct_grouped_answers(query, field, group_field)
    else
      query = query.select(
        select_query(field, as: 'answer')
      )
      answers = construct_not_grouped_answers(query, field)
    end

    # Sort correctly
    answers = answers.sort_by { |a| -a[:count] } unless field.input_type == 'linear_scale'
    answers = answers.sort_by { |a| a[:answer] == 'other' ? 1 : 0 } # other should always be last

    # Build response
    build_select_response(answers, field, group_field)
  end

  def build_select_response(answers, field, group_field)
    # TODO: This is an additional query for selects so performance issue here
    question_response_count = inputs.where("custom_field_values->'#{field.key}' IS NOT NULL").count
    attributes = core_field_attributes(field, question_response_count).merge({
      grouped: !!group_field,
      totalPickCount: answers.pluck(:count).sum,
      answers: answers,
      multilocs: get_multilocs(field, group_field)
    })
    attributes[:textResponses] = collect_other_text_responses(field) if field.other_option_text_field
    attributes[:legend] = group_field.options.map(&:key) + [nil] if group_field.present?

    attributes
  end

  def get_multilocs(field, group_field)
    multilocs = { answer: get_option_details(field) }
    multilocs[:group] = get_option_details(group_field) if group_field
    multilocs
  end

  def get_option_details(field)
    field.options.each_with_object({}) do |option, accu|
      option_detail = { title_multiloc: option.title_multiloc }
      option_detail[:image] = option.image&.image&.versions&.transform_values(&:url) if field.support_option_images?
      accu[option.key] = option_detail
    end
  end

  def collect_other_text_responses(field)
    inputs
      .select("custom_field_values->'#{field.key}_other' as value")
      .where("custom_field_values->'#{field.key}_other' IS NOT NULL")
      .map do |answer|
        { answer: answer.value }
      end
  end

  # Grouper methods
  def find_question(question_field_id)
    question = form.custom_fields.find_by(id: question_field_id)
    raise 'Question not found' unless question

    question
  end

  def select_query(field, as: 'answer')
    table = field.resource_type == 'User' ? 'users' : 'ideas'

    if %w[select linear_scale].include? field.input_type
      "COALESCE(#{table}.custom_field_values->'#{field.key}', 'null') as #{as}"
    else
      %{
          jsonb_array_elements(
            CASE WHEN jsonb_path_exists(#{table}.custom_field_values, '$ ? (exists (@.#{field.key}))')
              THEN #{table}.custom_field_values->'#{field.key}'
              ELSE '[null]'::jsonb END
          ) as #{as}
      }
    end
  end

  def construct_not_grouped_answers(query, field)
    answer_keys = (field.input_type == 'linear_scale' ? (1..field.maximum).reverse_each.to_a : field.options.map(&:key)) + [nil]

    grouped_answers_hash = apply_grouping(query)
      .each_with_object({}) do |(answer, count), accu|
      valid_answer = answer_keys.include?(answer) ? answer : nil

      accu[valid_answer] ||= { answer: valid_answer, count: 0 }
      accu[valid_answer][:count] += count
    end

    answer_keys.map do |key|
      grouped_answers_hash[key] || { answer: key, count: 0 }
    end
  end

  def construct_grouped_answers(query, question_field, group_field)
    answer_keys = question_field.options.map(&:key) + [nil]
    group_field_keys = group_field.options.map(&:key) + [nil]

    # Create hash of grouped answers
    grouped_answers_hash = apply_grouping(query, group: true)
      .each_with_object({}) do |((answer, group), count), accu|
      # We treat 'faulty' values (i.e. that don't exist in options) as nil
      valid_answer = answer_keys.include?(answer) ? answer : nil

      accu[valid_answer] ||= { answer: valid_answer, count: 0, groups: {} }
      accu[valid_answer][:count] += count

      # Same for group
      valid_group = group_field_keys.include?(group) ? group : nil

      accu[valid_answer][:groups][valid_group] ||= { group: valid_group, count: 0 }
      accu[valid_answer][:groups][valid_group][:count] += count
    end

    # Construct answers array using order of custom field options
    answers = answer_keys.map do |answer|
      grouped_answer = grouped_answers_hash[answer] || { answer: answer, count: 0, groups: {} }

      answers_row = {
        answer: answer,
        count: grouped_answer[:count],
        groups: group_field_keys.map do |group|
          grouped_answer[:groups][group] || { group: group, count: 0 }
        end
      }

      answers_row
    end

    answers.sort_by { |a| -a[:count] }
  end

  def apply_grouping(query, group: false)
    Idea
      .select(:answer)
      .from(query)
      .group(:answer, group ? :group : nil)
      .count
  end
end
