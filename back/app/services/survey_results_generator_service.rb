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

  def generate_results(field_id: nil, logic_ids: [])
    if field_id
      field = find_question(field_id)
      result = visit field
      cleanup_single_result(result)
    else
      results = fields.filter_map do |f|
        visit f
      end

      results = add_question_numbers_to_results results
      results = add_page_response_count_to_results results
      results = add_logic_to_results results, logic_ids

      {
        results: results,
        totalSubmissions: inputs.size
      }
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

  def visit_page(field)
    result = core_field_attributes(field, 0) # Response count gets updated later by looking at all the results
    result[:logic][:nextPageId] = field.logic['next_page_id'] if field.logic['next_page_id']
    result
  end

  private

  attr_reader :group_mode, :group_field_id, :fields, :inputs, :locales

  def core_field_attributes(field, response_count)
    {
      inputType: field.input_type,
      question: field.title_multiloc,
      description: field.description_multiloc,
      customFieldId: field.id,
      required: field.required,
      grouped: !!group_field_id,
      hidden: false,
      totalResponseCount: @inputs.count,
      questionResponseCount: response_count,
      pageNumber: nil,
      questionNumber: nil,
      logic: {}
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

    any_other_answer_page_id = field.logic['rules']&.find { |r| r['if'] == 'any_other_answer' }&.dig('goto_page_id')
    answer_multilocs = field.options.each_with_object({}) do |option, accu|
      logic_next_page_id = field.logic['rules']&.find { |r| r['if'] == option.id }&.dig('goto_page_id')
      option_detail = { title_multiloc: option.title_multiloc, id: option.id, logic: { nextPageId: logic_next_page_id || any_other_answer_page_id } }
      option_detail[:image] = option.image&.image&.versions&.transform_values(&:url) if field.support_option_images?
      accu[option.key] = option_detail
    end

    # Add a multiloc for no answer only if there is no_answer logic
    no_answer_logic_page = field.logic['rules']&.find { |r| r['if'] == 'no_answer' }&.dig('goto_page_id')
    if no_answer_logic_page
      answer_multilocs['no_answer'] = { title_multiloc: {}, id: "#{field.id}_no_answer", logic: { nextPageId: no_answer_logic_page } }
    end

    answer_multilocs
  end

  def build_linear_scale_multilocs(field)
    answer_multilocs = (1..field.maximum).index_with do |value|
      logic_next_page_id = field.logic['rules']&.find { |r| r['if'] == value }&.dig('goto_page_id')
      option_id = "#{field.id}_#{value}" # Create a unique ID for this option in the full results so we can filter logic
      { title_multiloc: locales.index_with { |_locale| value.to_s }, id: option_id, logic: { nextPageId: logic_next_page_id } }
    end

    answer_multilocs.each_key do |value|
      labels = field.nth_linear_scale_multiloc(value).transform_values do |label|
        label.present? ? "#{value} - #{label}" : value
      end

      answer_multilocs[value][:title_multiloc].merge! labels
    end

    # Add a multiloc for no answer only if there is no_answer logic
    no_answer_logic_page = field.logic['rules']&.find { |r| r['if'] == 'no_answer' }&.dig('goto_page_id')
    if no_answer_logic_page
      answer_multilocs['no_answer'] = { title_multiloc: {}, id: "#{field.id}_no_answer", logic: { nextPageId: no_answer_logic_page } }
    end

    answer_multilocs
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

  def add_page_response_count_to_results(results)
    current_page_index = nil
    max_response_count = 0
    results.each_with_index do |result, index|
      if result[:inputType] == 'page'
        results[current_page_index][:questionResponseCount] = max_response_count unless current_page_index.nil?
        current_page_index = index
        max_response_count = 0
      elsif result[:questionResponseCount] > max_response_count
        max_response_count = result[:questionResponseCount]
      end
    end
    results[current_page_index][:questionResponseCount] = max_response_count unless current_page_index.nil?
    results
  end

  def add_question_numbers_to_results(results)
    question_number = 0
    page_number = 0
    results.map do |result|
      if result[:inputType] == 'page'
        page_number += 1
        result[:questionNumber] = nil
        result[:pageNumber] = page_number
      else
        question_number += 1
        result[:questionNumber] = question_number
        result[:pageNumber] = nil
      end
      result
    end
  end

  def add_logic_to_results(results, logic_ids)
    results_to_hide = []

    # Replace logicNextPageId with logicNextPageNumber - used by FE in logic tooltip
    # Note: 999 is a special number used for the survey end
    # And work out how which questions are skipped by logic
    results = results.map do |result|
      # Replace in page logic
      logic_next_page_id = result[:logic][:nextPageId]
      field_id = result[:customFieldId]
      if logic_next_page_id
        # TODO: JS - repeated logic - refactor into method
        next_page = results.find { |r| r[:customFieldId] == logic_next_page_id }
        result[:logic][:nextPageNumber] = next_page ? next_page[:pageNumber] : nil
        result[:logic][:nextPageNumber] = 999 if logic_next_page_id == 'survey_end'

        logic_skipped_fields = logic_get_skipped_field_ids(results, field_id, logic_next_page_id)
        result[:logic][:numQuestionsSkipped] = logic_skipped_fields.size
        if logic_ids.include?(field_id)
          results_to_hide += logic_skipped_fields
        end
      end
      result[:logic].delete(:nextPageId)

      if select_input_type? result[:inputType]
        # Do the same for select options
        result[:multilocs][:answer]&.each_value do |answer|
          logic_next_page_id = answer[:logic][:nextPageId]
          if logic_next_page_id
            next_page = results.find { |r| r[:customFieldId] == logic_next_page_id }
            answer[:logic][:nextPageNumber] = next_page ? next_page[:pageNumber] : nil
            answer[:logic][:nextPageNumber] = 999 if logic_next_page_id == 'survey_end'

            logic_skipped_fields = logic_get_skipped_field_ids(results, field_id, logic_next_page_id)
            answer[:logic][:numQuestionsSkipped] = logic_skipped_fields.count { |f| f[:question] == true }
            if logic_ids.include?(answer[:id])
              results_to_hide += logic_skipped_fields.pluck(:id)
            end
          end
          answer[:logic].delete(:nextPageId)
        end

        # Logic & id elements are not needed for group multilocs
        result[:multilocs][:group]&.each_value do |group|
          group.delete(:id)
          group.delete(:logic)
        end
      end

      result
    end

    # Now hide any results which should be hidden by the logic ids supplied for filtering
    results.map do |result|
      result[:hidden] = results_to_hide.include?(result[:customFieldId])
      result
    end
  end

  def logic_get_skipped_field_ids(results, field_id, goto_page_id)
    skip = false
    skip_from_next_page = false
    skip_fields = []
    results.each do |r|
      if r[:customFieldId] == goto_page_id
        skip = false
        skip_from_next_page = false
      end
      skip = true if skip_from_next_page && r[:inputType] == 'page'
      skip_fields << { id: r[:customFieldId], question: r[:inputType] != 'page' } if skip
      skip_from_next_page = true if r[:customFieldId] == field_id
    end
    skip_fields
  end

  def cleanup_single_result(result)
    # Logic not used on single result
    result[:logic] = {}
    if select_input_type? result[:inputType]
      result[:multilocs][:answer]&.each_value do |answer|
        answer[:logic] = {}
      end
      result[:multilocs][:group]&.each_value do |group|
        group.delete(:id)
        group.delete(:logic)
      end
    end
    result
  end

  def select_input_type?(input_type)
    %w[select multiselect linear_scale multiselect_image].include? input_type
  end
end
