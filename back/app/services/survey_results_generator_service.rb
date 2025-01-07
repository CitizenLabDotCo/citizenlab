# frozen_string_literal: true

class SurveyResultsGeneratorService < FieldVisitorService
  def initialize(phase, group_mode: nil, group_field_id: nil)
    super()
    @group_mode = group_mode
    @group_field_id = group_field_id
    form = phase.custom_form || CustomForm.new(participation_context: phase)
    @fields = IdeaCustomFieldsService.new(form).enabled_fields # It would be nice if we could use reportable_fields instead
    @inputs = phase.ideas.native_survey.published
    @locales = AppConfiguration.instance.settings('core', 'locales')
  end

  def generate_results(field_id: nil)
    if field_id
      field = find_question(field_id)
      visit field
    else
      results = fields.filter_map do |f|
        visit f
      end

      results = add_maybe_skipped_by_logic_flag(results)

      {
        results: results,
        totalSubmissions: inputs.size
      }
    end
  end

  def add_maybe_skipped_by_logic_flag(results)
    # Does a field potentially get skipped by logic - check each field and flag if so
    maybe_skipped_fields = []
    @fields.each_with_index do |field, index|
      # Check which fields appear between this field and the page we potentially skip to
      rest_of_fields = @fields[index + 1..]
      field[:logic]['rules']&.each do |rule|
        page_id = rule['goto_page_id']
        rest_of_fields.each do |f|
          break if f[:id] == page_id
          next if f[:input_type] == 'page'

          maybe_skipped_fields << f[:id]
        end
      end
    end
    maybe_skipped_fields = maybe_skipped_fields.uniq

    results.map do |result|
      result[:maybeSkippedByLogic] = result[:customFieldId].in?(maybe_skipped_fields)
      result
    end
  end

  def visit_number(field)
    responses = base_responses(field)
    response_count = responses.size

    core_field_attributes(field, response_count).merge({
      numberResponses: responses
    })
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

  def visit_text(field)
    answers = get_text_responses(field.key)
    response_count = answers.size
    core_field_attributes(field, response_count).merge({
      textResponses: answers
    })
  end

  def visit_multiline_text(field)
    visit_text(field)
  end

  def visit_linear_scale(field)
    visit_select_base(field)
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

  def visit_shapefile_upload(field)
    visit_file_upload(field)
  end

  def visit_point(field)
    responses_to_geographic_input_type(field)
  end

  def visit_line(field)
    responses_to_geographic_input_type(field)
  end

  def visit_polygon(field)
    responses_to_geographic_input_type(field)
  end

  private

  attr_reader :group_mode, :group_field_id, :fields, :inputs, :locales

  def core_field_attributes(field, response_count)
    {
      inputType: field.input_type,
      question: field.title_multiloc,
      customFieldId: field.id,
      required: field.required,
      grouped: !!group_field_id,
      totalResponseCount: @inputs.count,
      questionResponseCount: response_count
    }
  end

  def base_responses(field)
    inputs
      .select("custom_field_values->'#{field.key}' as value")
      .where("custom_field_values->'#{field.key}' IS NOT NULL")
      .map do |response|
        { answer: response.value }
      end
  end

  def visit_select_base(field)
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
      raise "Unsupported group field type: #{group_field.input_type}" unless %w[select linear_scale].include?(group_field.input_type)
      raise "Unsupported question type: #{field.input_type}" unless %w[select multiselect linear_scale multiselect_image].include?(field.input_type)

      query = query.select(
        select_field_query(field, as: 'answer'),
        select_field_query(group_field, as: 'group')
      )
      answers = construct_grouped_answers(query, field, group_field)
    else
      query = query.select(
        select_field_query(field, as: 'answer')
      )
      answers = construct_not_grouped_answers(query, field)
    end

    # Sort correctly
    answers = answers.sort_by { |a| -a[:count] } unless field.input_type == 'linear_scale'
    answers = answers.sort_by { |a| a[:answer] == 'other' ? 1 : 0 } # other should always be last

    # Build response
    build_select_response(answers, field, group_field)
  end

  def select_field_query(field, as: 'answer')
    table = field.resource_type == 'User' ? 'users' : 'ideas'

    if %w[select linear_scale].include? field.input_type
      "COALESCE(#{table}.custom_field_values->'#{field.key}', 'null') as #{as}"
    elsif %w[multiselect multiselect_image].include? field.input_type
      %{
          jsonb_array_elements(
            CASE WHEN jsonb_path_exists(#{table}.custom_field_values, '$ ? (exists (@."#{field.key}"))')
              THEN #{table}.custom_field_values->'#{field.key}'
              ELSE '[null]'::jsonb END
          ) as #{as}
      }
    else
      raise "Unsupported field type: #{field.input_type}"
    end
  end

  def responses_to_geographic_input_type(field)
    responses = base_responses(field)
    response_count = responses.size

    core_field_attributes(field, response_count).merge({
      mapConfigId: field&.map_config&.id, "#{field.input_type}Responses": responses
    })
  end

  def build_select_response(answers, field, group_field)
    # TODO: This is an additional query for selects so performance issue here
    question_response_count = inputs.where("custom_field_values->'#{field.key}' IS NOT NULL").count

    attributes = core_field_attributes(field, question_response_count).merge({
      totalPickCount: answers.pluck(:count).sum,
      answers: answers,
      multilocs: get_multilocs(field, group_field)
    })

    attributes[:textResponses] = get_text_responses("#{field.key}_other") if field.other_option_text_field
    attributes[:legend] = generate_answer_keys(group_field) if group_field.present?

    attributes
  end

  def get_multilocs(field, group_field)
    multilocs = { answer: get_option_multilocs(field) }
    multilocs[:group] = get_option_multilocs(group_field) if group_field
    multilocs
  end

  def get_option_multilocs(field)
    if field.input_type == 'linear_scale'
      return build_linear_scale_multilocs(field)
    end

    field.options.each_with_object({}) do |option, accu|
      option_detail = { title_multiloc: option.title_multiloc }
      option_detail[:image] = option.image&.image&.versions&.transform_values(&:url) if field.support_option_images?
      accu[option.key] = option_detail
    end
  end

  def get_text_responses(field_key)
    inputs
      .select("custom_field_values->'#{field_key}' as value")
      .where("custom_field_values->'#{field_key}' IS NOT NULL")
      .map { |answer| { answer: answer.value.to_s } }
      .sort_by { |a| a[:answer] }
  end

  def find_question(question_field_id)
    question = fields.find { |f| f[:id] == question_field_id }
    raise 'Question not found' unless question

    question
  end

  def construct_not_grouped_answers(query, field)
    answer_keys = generate_answer_keys(field)

    grouped_answers_hash = group_query(query)
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
    answer_keys = generate_answer_keys(question_field)
    group_field_keys = generate_answer_keys(group_field)

    # Create hash of grouped answers
    answer_groups = group_query(query, group: true)
    answer_groups = normalise_domicile_keys(answer_groups, group_field) if group_field.code == 'domicile'
    grouped_answers_hash = answer_groups
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
    answer_keys.map do |answer|
      grouped_answer = grouped_answers_hash[answer] || { answer: answer, count: 0, groups: {} }

      answers_row = {
        answer: answer,
        count: grouped_answer[:count],
        groups: group_field_keys
          .filter { |group| grouped_answer[:groups][group] }
          .map { |group| grouped_answer[:groups][group] }
      }

      answers_row
    end
  end

  def group_query(query, group: false)
    Idea
      .select(:answer)
      .from(query)
      .group(:answer, group ? :group : nil)
      .count
  end

  def generate_answer_keys(field)
    (field.input_type == 'linear_scale' ? (1..field.maximum).reverse_each.to_a : field.options.map(&:key)) + [nil]
  end

  # Convert stored user keys for domicile field to match the options keys eg "f6319053-d521-4b28-9d71-a3693ec95f45" => "north_london_8rg"
  def normalise_domicile_keys(answer_groups, domicile_field)
    # Load all the areas in one query as they are not preloaded elsewhere
    areas = Area.where(custom_field_option_id: domicile_field.options.pluck(:id))
    area_id_map = areas.map { |a| { a.custom_field_option_id => a.id } }.reduce({}, :merge)
    options_map = domicile_field.options.map { |o| { area_id_map[o.id] || 'outside' => o.key } }.reduce({}, :merge)

    new_groups = {}
    answer_groups.each do |(answer, group), count|
      new_group = options_map[group]
      new_groups[[answer, new_group]] = count
    end
    new_groups
  end

  def build_linear_scale_multilocs(field)
    answer_titles = (1..field.maximum).index_with do |value|
      { title_multiloc: locales.index_with { |_locale| value.to_s } }
    end

    answer_titles.each_key do |value|
      labels = field.nth_linear_scale_multiloc(value).transform_values do |label|
        label.present? ? "#{value} - #{label}" : value
      end

      answer_titles[value][:title_multiloc].merge! labels
    end

    answer_titles
  end
end
