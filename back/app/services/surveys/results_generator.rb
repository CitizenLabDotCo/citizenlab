# frozen_string_literal: true

# Base class for generating survey results - others inherit as follows:
# - ResultsWithGroupGenerator - allow grouping of single results
# - ResultsWithDateGenerator - allow filtering by year and quarter
# - ResultsWithLogicGenerator - apply survey logic to the results

module Surveys
  class ResultsGenerator < FieldVisitorService
    def initialize(phase, structure_by_category: false)
      super()
      @phase = phase
      form = phase.custom_form || CustomForm.new(participation_context: phase)
      @fields = IdeaCustomFieldsService.new(form).survey_results_fields(structure_by_category:)
      @locales = AppConfiguration.instance.settings('core', 'locales')
      @all_inputs = phase.ideas.supports_survey.published
      @structure_by_category = structure_by_category
    end

    # Get the results for a single survey question
    def generate_result_for_field(field_id)
      field = find_question(field_id)
      result = visit field
      add_averages([result]).first
    end

    # Get the results for all survey questions
    def generate_results
      results = fields.filter_map { |f| visit f }
      if results.present?
        results = add_question_numbers_to_results results
        results = add_page_response_count_to_results results
        results = add_averages results
        results = cleanup_results results
      end

      {
        results: results,
        totalSubmissions: @all_inputs.size
      }
    end

    def visit_number(field)
      responses = base_responses(field)
      response_count = responses.size

      core_field_attributes(field, response_count:).merge({
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

    def visit_ranking(field)
      core_field_attributes(field).merge({
        average_rankings: field.average_rankings(inputs(field)),
        rankings_counts: field.rankings_counts(inputs(field)),
        multilocs: get_multilocs(field)
      })
    end

    def visit_text(field)
      answers = get_text_responses(field)
      response_count = answers.size

      core_field_attributes(field, response_count:).merge({
        textResponses: answers
      })
    end

    def visit_multiline_text(field)
      visit_text(field)
    end

    def visit_linear_scale(field)
      visit_select_base(field)
    end

    def visit_matrix_linear_scale(field)
      core_field_attributes(field).merge({
        multilocs: { answer: build_scaled_input_multilocs(field) },
        linear_scales: matrix_linear_scale_statements(field)
      })
    end

    def visit_rating(field)
      visit_select_base(field)
    end

    def visit_sentiment_linear_scale(field)
      visit_select_base(field)
    end

    def visit_file_upload(field)
      file_ids = inputs(field)
        .select("custom_field_values->'#{field.key}'->'id' as value")
        .where("custom_field_values->'#{field.key}' IS NOT NULL")
        .map(&:value)

      files = ::Files::FileAttachment.where(id: file_ids).map do |attachment|
        { name: attachment.file.name, url: attachment.file.content.url }
      end

      files.concat(IdeaFile.where(id: file_ids).map do |file|
        { name: file.name, url: file.file.url }
      end)

      core_field_attributes(field, response_count: files.size).merge(files: files)
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
      core_field_attributes(field, response_count: 0) # Response count gets updated later by looking at all the results
    end

    private

    attr_reader :phase, :fields, :locales

    def survey_has_logic?
      return false if @structure_by_category # If structuring by category (community monitor only) then logic will never work

      @survey_has_logic ||= fields.any? { |field| field.logic != {} && field.logic != { 'rules' => [] } }
    end

    # Build a hash of field IDs to an array of input IDs that will have actually seen field based on logic
    # This enables us to accurately calculate the totalResponseCount for each field
    def seen_field_responses
      @seen_field_responses ||= begin
        # First nest the input_fields inside pages to make logic easier to process
        current_page = nil
        pages = {}
        fields.each do |field|
          current_page = field.id if field.input_type == 'page'
          pages[current_page] ||= []
          pages[current_page] << field
        end

        all_page_ids = pages.keys.compact

        # Next build the responses with an array of input IDs that were seen for each field based on logic & values
        @all_inputs.each_with_object({}) do |input, seen|
          next_page_id = nil
          pages.each do |page_id, fields_on_page|
            next unless next_page_id.nil? || page_id == next_page_id

            # Define the default next page if no logic changes it
            next_page_id = all_page_ids[all_page_ids.index(page_id) + 1]

            fields_on_page.each do |field|
              seen[field.id] ||= []
              seen[field.id] << input.id

              # Is there a different next page based on logic?
              next_logic_page_id = next_page_id_from_logic(field, input, all_page_ids)
              next_page_id = next_logic_page_id if next_logic_page_id
            end
          end
        end
      end
    end

    def next_page_id_from_logic(field, input, all_page_ids)
      return if field.logic.blank?

      # Any page logic that will change the next page?
      return field.logic['next_page_id'] if field.page?

      # Options / Linear scale logic
      field_value = input.custom_field_values[field.key]

      if field_value
        if field_value.is_a? Array
          # Multiple options selected (multiselect - legacy support)? We find the furthest page
          option_ids = field.options.select { |o| field_value.include?(o.key) }.map(&:id)
          option_next_page_ids = option_ids.map do |option_id|
            field.logic['rules']&.find { |r| r['if'] == option_id }&.dig('goto_page_id')
          end
          furthest_page_id = option_next_page_ids.max_by { |id| all_page_ids.index(id) }

          return furthest_page_id if furthest_page_id
        else
          # Individual option selected (single select / linear scale)
          option_value = field.supports_linear_scale? ? field_value : field.options.find { |o| o.key == field_value }&.id
          option_next_page_id = field.logic['rules']&.find { |r| r['if'] == option_value }&.dig('goto_page_id')
          return option_next_page_id if option_next_page_id
        end

        # Any other answer selected?
        field.logic['rules']&.find { |r| r['if'] == 'any_other_answer' }&.dig('goto_page_id')
      else
        # Field empty
        field.logic['rules']&.find { |r| r['if'] == 'no_answer' }&.dig('goto_page_id')
      end
    end

    def field_seen_count(field)
      return @all_inputs.size unless survey_has_logic?

      seen_field_responses[field.id]&.count || 0
    end

    # Pre-filters inputs based on logic if there is any logic
    def inputs(field)
      return @all_inputs unless survey_has_logic?

      input_ids = seen_field_responses[field.id]
      @all_inputs.where(id: input_ids)
    end

    def core_field_attributes(field, response_count: nil)
      response_count ||= base_responses(field).size
      {
        inputType: field.input_type,
        question: field.title_multiloc,
        description: field.description_multiloc,
        customFieldId: field.id,
        required: field.required,
        grouped: false,
        hidden: false,
        totalResponseCount: field_seen_count(field),
        questionResponseCount: response_count,
        pageNumber: nil,
        questionNumber: nil,
        questionCategory: field.question_category
      }
    end

    def base_responses(field)
      inputs(field)
        .select("custom_field_values->'#{field.key}' as value")
        .where("custom_field_values->'#{field.key}' IS NOT NULL")
        .map do |response|
        { answer: response.value }
      end
    end

    def visit_select_base(field)
      query = inputs(field).select(
        select_field_query(field, as: 'answer')
      )
      answers = construct_select_answers(query, field)

      # Build response
      build_select_response(answers, field)
    end

    def select_field_query(field, as: 'answer')
      table = field.resource_type == 'User' ? 'users' : 'ideas'

      if field.supports_single_selection?
        "COALESCE(#{table}.custom_field_values->'#{field.key}', 'null') as #{as}"
      elsif field.supports_multiple_selection?
        %{
          jsonb_array_elements(
            CASE WHEN (
              jsonb_path_exists(#{table}.custom_field_values, '$ ? (exists (@."#{field.key}"))') AND
              jsonb_typeof(#{table}.custom_field_values->'#{field.key}') = 'array'
            ) THEN #{table}.custom_field_values->'#{field.key}'
              ELSE '[null]'::jsonb END
          ) as #{as}
      }
      else
        raise "Unsupported field type: #{field.input_type}"
      end
    end

    def build_select_response(answers, field)
      # NOTE: This is an additional query needed for multi-selects only which impacts performance slightly
      question_response_count = if field.supports_multiple_selection?
        inputs(field).where("custom_field_values->'#{field.key}' IS NOT NULL").count
      else
        answers.reject { |a| a[:answer].nil? }.pluck(:count).sum
      end

      # Sort answers correctly
      answers = answers.sort_by { |a| -a[:count] } unless field.supports_linear_scale?
      answers = answers.sort_by { |a| a[:answer] == 'other' ? 1 : 0 } # other should always be last

      attributes = core_field_attributes(field, response_count: question_response_count).merge({
        totalPickCount: answers.pluck(:count).sum,
        answers: answers,
        multilocs: get_multilocs(field)
      })

      attributes[:textResponses] = get_text_responses(field, additional_text_question_key: field.additional_text_question_key) if field.additional_text_question_key

      attributes
    end

    def get_multilocs(field)
      { answer: get_option_multilocs(field) }
    end

    def get_option_multilocs(field)
      if field.supports_linear_scale?
        return build_scaled_input_multilocs(field)
      end

      field.ordered_transformed_options.each_with_object({}) do |option, accu|
        option_detail = { title_multiloc: option.title_multiloc }
        option_detail[:image] = option.image&.image&.versions&.transform_values(&:url) if field.supports_option_images?
        accu[option.key] = option_detail
      end
    end

    def build_scaled_input_multilocs(field)
      answer_multilocs = (1..field.maximum).index_with do |value|
        { title_multiloc: locales.index_with { |_locale| value.to_s } }
      end

      answer_multilocs.each_key do |value|
        labels = field.nth_linear_scale_multiloc(value).transform_values do |label|
          label.present? && field.supports_linear_scale_labels? ? "#{value} - #{label}" : value
        end

        answer_multilocs[value][:title_multiloc].merge! labels
      end

      answer_multilocs
    end

    def construct_select_answers(query, field)
      answer_keys = generate_select_answer_keys(field)

      grouped_answers_hash = select_group_query(query)
        .each_with_object({}) do |(answer, count), accu|
        valid_answer = answer_keys.include?(answer) ? answer : nil

        accu[valid_answer] ||= { answer: valid_answer, count: 0 }
        accu[valid_answer][:count] += count
      end

      answer_keys.map do |key|
        grouped_answers_hash[key] || { answer: key, count: 0 }
      end
    end

    def select_group_query(query)
      Idea
        .select(:answer)
        .from(query)
        .group(:answer)
        .count
    end

    def generate_select_answer_keys(field)
      (field.supports_linear_scale? ? (1..field.maximum).to_a : field.ordered_transformed_options.map(&:key)) + [nil]
    end

    def matrix_linear_scale_statements(field)
      field.matrix_statements.pluck(:key, :title_multiloc).to_h do |statement_key, statement_title_multiloc|
        query_result = inputs(field).group("custom_field_values->'#{field.key}'->'#{statement_key}'").count
        answers = (1..field.maximum).reverse_each.map do |answer|
          { answer: answer, count: query_result[answer] || 0 }
        end
        question_response_count = answers.sum { |a| a[:count] }
        answers.each do |answer|
          answer[:percentage] = question_response_count > 0 ? (answer[:count].to_f / question_response_count) : 0.0
        end
        answers += [{ answer: nil, count: query_result[nil] || 0 }]
        value = {
          question: statement_title_multiloc,
          questionResponseCount: question_response_count,
          answers:
        }
        [statement_key, value]
      end
    end

    def responses_to_geographic_input_type(field)
      responses = base_responses(field)
      response_count = responses.size
      core_field_attributes(field, response_count:).merge({
        mapConfigId: field&.map_config&.id, "#{field.input_type}Responses": responses
      })
    end

    # Get any associated text responses - where follow up question or other option is used
    def get_text_responses(field, additional_text_question_key: nil)
      field_key = additional_text_question_key || field.key
      inputs(field)
        .select("custom_field_values->'#{field_key}' as value")
        .where("custom_field_values->'#{field_key}' IS NOT NULL")
        # Remove all sequences of one or more whitespace characters (including spaces, newlines, tabs),
        # then check the result is not empty. TRIM would not handle newlines correctly.
        .where("regexp_replace(custom_field_values->>'#{field_key}', '[[:space:]]+', '', 'g') != ''")
        .map { |answer| { answer: answer.value.to_s } }
        .sort_by { |a| a[:answer] }
    end

    def find_question(question_field_id)
      question = fields.find { |f| f[:id] == question_field_id }
      raise 'Question not found' unless question

      question
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
      @page_numbers = {} # Lookup that we can use later in logic.
      question_number = 0
      page_number = 0
      results.map do |result|
        if result[:inputType] == 'page'
          page_number += 1
          result[:questionNumber] = nil
          result[:pageNumber] = page_number
          @page_numbers[result[:customFieldId]] = page_number
        else
          question_number += 1
          result[:questionNumber] = question_number
          result[:pageNumber] = nil
        end
        result
      end
    end

    def add_averages(results)
      # By default 'this_period' is all time
      averages = AverageGenerator.new(phase).field_averages

      # Merge the averages into the main results
      results.each do |result|
        field_average = averages[result[:customFieldId]]
        if field_average
          result[:averages] = {
            this_period: field_average
          }
        end
      end
    end

    def cleanup_results(results)
      # Remove the last page - needed for calculations, but not for display
      results.pop if results.last[:inputType] == 'page'
      results
    end
  end
end
