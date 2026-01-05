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
      @structure_by_category = structure_by_category
      @locales = AppConfiguration.instance.settings('core', 'locales')
    end

    # Get the results for a single survey question
    def generate_result_for_field(field_id)
      result = generate_results[:results].find { |r| r[:customFieldId] == field_id }
      raise 'Question not found' unless result

      result
    end

    # Get the results for all survey questions
    def generate_results
      results = input_fields.filter_map { |f| f.additional_text_question? ? nil : visit(f) } # Skip other/follow_up questions
      if results.present?
        results = add_question_numbers_to_results results
        results = add_page_response_count_to_results results
        results = add_averages results
        results = add_additional_attributes_to_results results
        results = cleanup_results results
      end

      {
        results: results,
        totalSubmissions: total_response_count
      }
    end

    def visit_number(field)
      responses = base_responses(field.id).map { |r| r.except(:id) }

      core_field_attributes(field).merge({
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
      responses = base_responses(field.id).pluck(:answer)
      option_keys = field.options.pluck(:key)

      # Calculate the counts for each ranking position per option
      rankings_counts = option_keys.index_with do |_key|
        (1..option_keys.count).to_a.index_with { |_i| 0 }
      end

      option_keys.each do |k|
        responses.each do |r|
          index = r.index(k)
          next unless index

          rank = index + 1
          rankings_counts[k][rank] += 1
        end
      end

      # Calculate average ranking per option
      average_rankings = rankings_counts.transform_values do |counts|
        total = counts.sum { |rank, count| rank * count }
        count = counts.values.sum
        (total.to_f / count).round(2)
      end

      core_field_attributes(field).merge({
        average_rankings:,
        rankings_counts:,
        multilocs: get_multilocs(field)
      })
    end

    def visit_text(field)
      answers = get_text_responses(field.id)

      core_field_attributes(field).merge({
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
      file_ids = base_responses(field.id).map { |a| a[:answer]['id'] } || []

      files = ::Files::FileAttachment.where(id: file_ids).map do |attachment|
        { name: attachment.file.name, url: attachment.file.content.url }
      end

      files.concat(IdeaFile.where(id: file_ids).map do |file|
        { name: file.name, url: file.file.url }
      end)

      core_field_attributes(field).merge(files: files)
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
      core_field_attributes(field) # Response count gets updated later by looking at all the results
    end

    private

    attr_reader :phase, :locales, :structure_by_category

    def input_fields
      @input_fields ||= IdeaCustomFieldsService
        .new(phase.custom_form || CustomForm.new(participation_context: phase))
        .survey_results_fields(structure_by_category: structure_by_category)
    end

    def user_fields
      @user_fields ||= CustomField.registration.includes(:options)
    end

    def survey_inputs
      @survey_inputs ||= phase.ideas.includes(:author).supports_survey.published
    end

    def responses_by_field
      @responses_by_field ||= begin
        # First nest the input_fields inside pages to make logic easier
        current_page = nil
        pages = {}
        input_fields.each do |field|
          current_page = field.id if field.input_type == 'page'
          pages[current_page] ||= []
          pages[current_page] << field
        end

        all_page_ids = pages.keys.compact

        # Next build the responses with an array of field IDs that were seen based on logic & values
        seen_responses = survey_inputs.map do |input|
          seen = []
          if survey_has_logic?
            next_page_id = nil
            pages.each do |page_id, fields_on_page|
              next unless next_page_id.nil? || page_id == next_page_id

              # Define the default next page if no logic changes it
              next_page_id = all_page_ids[all_page_ids.index(page_id) + 1]

              fields_on_page.each do |field|
                seen << field.id

                # TODO: Not currently adding the other/follow_up input_fields in here - ie if other option selected it will have been seen

                # Is there a different next page based on logic?
                next_logic_page_id = next_page_id_from_logic(field, input)
                next_page_id = next_logic_page_id if next_logic_page_id
              end
            end
          end

          {
            id: input.id,
            values: merge_user_custom_field_values(input),
            seen: seen
          }
        end

        # Now build the structure removing any responses that were not seen due to logic
        # nil values are added which means seen but not answered
        responses = input_fields.to_h do |field|
          [
            field.id,
            seen_responses.filter_map do |response|
              next if survey_has_logic? && response[:seen].exclude?(field.id)

              {
                id: response[:id],
                answer: response[:values][field.key]
              }
            end
          ]
        end

        # Now add in the user input_fields too if not already there in the input fields - generate_fields only returns fields in the form,
        # but when grouping we need the additional user fields in the raw responses too
        # Logic not needed here as these fields will only be used for grouping
        responses.merge(
          user_fields.each_with_object({}) do |field, accu|
            next if responses.key?(field.id) # Field already present in input fields

            accu[field.id] = seen_responses.map do |response|
              {
                id: response[:id],
                answer: response[:values][field.key]
              }
            end
          end
        )
      end
    end

    def total_response_count
      # Number of responses for the first page will always be total responses
      num_times_field_seen(responses_by_field.keys.first)
    end

    def next_page_id_from_logic(field, input)
      return if field.logic.blank?

      # Any page logic that will change the next page?
      return field.logic['next_page_id'] if field.page?

      # Options/ Linear scale logic
      field_value = input.custom_field_values[field.key]

      if field_value
        # Individual option selected?
        option_value = field.supports_linear_scale? ? field_value : field.options.find { |o| o.key == field_value }&.id
        option_next_page_id = field.logic['rules']&.find { |r| r['if'] == option_value }&.dig('goto_page_id')
        return option_next_page_id if option_next_page_id

        # Any other answer selected?
        field.logic['rules']&.find { |r| r['if'] == 'any_other_answer' }&.dig('goto_page_id')
      else
        # Field empty
        field.logic['rules']&.find { |r| r['if'] == 'no_answer' }&.dig('goto_page_id')
      end
    end

    def merge_user_custom_field_values(input)
      user_values = input.author&.custom_field_values&.transform_keys { |k| "u_#{k}" } || {}
      user_values.merge(input.custom_field_values) # Idea values take priority over user values
    end

    def survey_has_logic?
      return false if structure_by_category # If structuring by category (community monitor only) then logic will not work

      @survey_has_logic ||= input_fields.any? { |field| field.logic != {} }
    end

    def num_times_field_seen(field_id)
      responses_by_field[field_id].size
    end

    def add_additional_attributes_to_results(results)
      results # This method is a placeholder for overriding in subclasses
    end

    def core_field_attributes(field)
      response_count = base_responses(field.id).size
      {
        inputType: field.input_type,
        question: field.title_multiloc,
        description: field.description_multiloc,
        customFieldId: field.id,
        required: field.required,
        grouped: false,
        hidden: false,
        totalResponseCount: num_times_field_seen(field.id), # NOTE: This is technically 'questionSeenCount' but we have to keep backwards compatibility for report builder
        questionResponseCount: response_count, # NOTE: This is technically 'questionAnsweredCount'
        pageNumber: nil,
        questionNumber: nil,
        questionCategory: field.question_category
      }
    end

    def base_responses(field_id, with_nil_answers: false)
      return responses_by_field[field_id] if with_nil_answers

      responses_by_field[field_id]
        &.select { |r| r[:answer].present? }
    end

    def visit_select_base(field)
      responses = select_field_answers(field.id)

      # Count all the answers
      counts = responses.group_by { |h| h[:answer] }.transform_values(&:count)

      # Build the result array with all required answers
      answer_keys = generate_select_answer_keys(field)
      answers = answer_keys.map { |a| { answer: a, count: counts[a] || 0 } }

      # Add the nil counts
      answers << { answer: nil, count: nil_response_count(field) }

      # Build response
      build_select_response(answers, field)
    end

    def select_field_answers(field_id, with_nil_answers: false)
      # Extract all the responses from array values (if multiselect)
      base_responses(field_id, with_nil_answers:).flat_map do |r|
        if r[:answer].is_a?(Array)
          r[:answer].map { |a| { id: r[:id], answer: a } }
        else
          { id: r[:id], answer: r[:answer] }
        end
      end
    end

    def nil_response_count(field, matrix_statement_key: nil)
      nil_count = responses_by_field[field.id].size - base_responses(field.id).size
      return nil_count unless matrix_statement_key

      # For matrix questions we also need to count those that did not answer the specific statement
      nil_count + base_responses(field.id).count { |h| !h[:answer].key?(matrix_statement_key) }
    end

    def build_select_response(answers, field)
      # Sort answers correctly
      answers = answers.sort_by { |a| -a[:count] } unless field.supports_linear_scale?
      answers = answers.sort_by { |a| a[:answer] == 'other' ? 1 : 0 } # other should always be last

      attributes = core_field_attributes(field).merge({
        totalPickCount: answers.pluck(:count).sum,
        answers: answers,
        multilocs: get_multilocs(field)
      })

      attributes[:textResponses] = get_text_responses(field.additional_text_question_id) if field.additional_text_question_id

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

    def generate_select_answer_keys(field)
      (field.supports_linear_scale? ? (1..field.maximum).to_a : field.ordered_transformed_options.map(&:key))
    end

    def matrix_linear_scale_statements(field)
      field.matrix_statements.pluck(:key, :title_multiloc).to_h do |statement_key, statement_title_multiloc|
        statement_counts = base_responses(field.id)
          .filter_map { |h| h[:answer][statement_key] }
          .group_by(&:itself)
          .transform_values(&:count)

        answers = (1..field.maximum).reverse_each.map do |answer|
          { answer: answer, count: statement_counts[answer] || 0 }
        end
        question_response_count = answers.sum { |a| a[:count] }
        answers.each do |answer|
          answer[:percentage] = question_response_count > 0 ? (answer[:count].to_f / question_response_count) : 0.0
        end

        # Add count for nil answers
        answers += [{ answer: nil, count: nil_response_count(field, matrix_statement_key: statement_key) }]
        value = {
          question: statement_title_multiloc,
          questionResponseCount: question_response_count,
          answers:
        }

        [statement_key, value]
      end
    end

    def responses_to_geographic_input_type(field)
      responses = base_responses(field.id).map { |r| r.except(:id) }

      core_field_attributes(field).merge({
        mapConfigId: field&.map_config&.id, "#{field.input_type}Responses": responses
      })
    end

    # Get any associated text responses - for both text questions and follow-up/other question
    def get_text_responses(field_id)
      base_responses(field_id)
        &.map { |a| a.except(:id) }
        &.sort_by { |a| a[:answer] } || []
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
