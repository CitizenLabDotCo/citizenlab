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
      @inputs = phase.ideas.supports_survey.published
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
        results = add_additional_fields_to_results results
        results = cleanup_results results
      end

      {
        results: results,
        totalSubmissions: inputs.size
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
        average_rankings: field.average_rankings(inputs),
        rankings_counts: field.rankings_counts(inputs),
        multilocs: get_multilocs(field)
      })
    end

    def visit_text(field)
      answers = get_text_responses(field.key)
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
      file_ids = inputs
        .select("custom_field_values->'#{field.key}'->'id' as value")
        .where("custom_field_values->'#{field.key}' IS NOT NULL")
        .map(&:value)
      files = IdeaFile.where(id: file_ids).map do |file|
        { name: file.name, url: file.file.url }
      end
      response_count = files.size

      core_field_attributes(field, response_count:).merge({
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
      core_field_attributes(field, response_count: 0) # Response count gets updated later by looking at all the results
    end

    private

    attr_reader :phase, :fields, :inputs, :locales

    def add_additional_fields_to_results(results)
      results # This method is a placeholder for overriding in subclasses
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
        totalResponseCount: @inputs.size,
        questionResponseCount: response_count,
        pageNumber: nil,
        questionNumber: nil,
        questionCategory: field.question_category
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
      query = inputs.select(
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
            CASE WHEN jsonb_path_exists(#{table}.custom_field_values, '$ ? (exists (@."#{field.key}"))')
              THEN #{table}.custom_field_values->'#{field.key}'
              ELSE '[null]'::jsonb END
          ) as #{as}
      }
      else
        raise "Unsupported field type: #{field.input_type}"
      end
    end

    def build_select_response(answers, field)
      # NOTE: This is an additional query for selects so impacts performance slightly
      question_response_count = inputs.where("custom_field_values->'#{field.key}' IS NOT NULL").count

      # Sort answers correctly
      answers = answers.sort_by { |a| -a[:count] } unless field.supports_linear_scale?
      answers = answers.sort_by { |a| a[:answer] == 'other' ? 1 : 0 } # other should always be last

      attributes = core_field_attributes(field, response_count: question_response_count).merge({
        totalPickCount: answers.pluck(:count).sum,
        answers: answers,
        multilocs: get_multilocs(field)
      })

      attributes[:textResponses] = get_text_responses(field.additional_text_question_key) if field.additional_text_question_key

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
        option_detail[:image] = option.image&.image&.versions&.transform_values(&:url) if field.support_option_images?
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
        query_result = inputs.group("custom_field_values->'#{field.key}'->'#{statement_key}'").count
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
