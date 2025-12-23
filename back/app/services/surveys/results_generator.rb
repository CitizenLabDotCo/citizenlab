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
      
      @user_fields = CustomField.registration
      @input_fields = IdeaCustomFieldsService.new(form).survey_results_fields(structure_by_category:)
      @locales = AppConfiguration.instance.settings('core', 'locales')
      @inputs = phase.ideas.supports_survey.published # TODO: Add .includes(:author)
      @responses_by_field = format_responses_by_field
    end

    def survey_has_logic?
      @survey_has_logic ||= input_fields.any? { |field| field.logic != {} }
    end

    def total_response_count
      # Number of responses for the first page will always be total responses
      num_times_field_seen(responses_by_field.keys.first)
    end

    def num_times_field_seen(field_key)
      responses_by_field[field_key].size
    end

    # TODO: Reformat to make smaller { "7c4fda2e-d552-4c27-b9a3-5ed86ce0698d" => "female" }
    def format_responses_by_field
      # TODO: If structure by category is enabled then logic will not work any more - community monitor only?

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
      responses = inputs.map do |input|
        seen = []
        if survey_has_logic?
          next_page_id = nil
          pages.each do |page_id, input_fields|
            next unless next_page_id.nil? || page_id == next_page_id

            input_fields.each do |field|
              seen << field.key

              # TODO: Not currently adding the other/follow_up input_fields in here - ie if other option selected it will have been seen

              if field.page?
                if field.logic['next_page_id']
                  # Any page logic that will change the next page?
                  next_page_id = field.logic['next_page_id']
                else
                  # By default go to the next page
                  next_page_id = all_page_ids[all_page_ids.index(page_id) + 1]
                end
              elsif field.logic['rules']
                # TODO: select or linear scale input_fields
              end
            end
          end
        end

        # TODO: Add the values from users here too

        {
          id: input.id,
          values: merge_user_custom_field_values(input),
          seen: seen
        }
      end

      # Now build the structure with only those responses per question that were seen
      # So nil values mean that they were seen but not answered
      responses_by_field = input_fields.to_h do |field|
        [
          field.key,
          responses.map do |response|
            # Remove any responses that were not seen due to logic
            next if survey_has_logic? && response[:seen].exclude?(field.key)

            {
              id: response[:id],
              answer: response[:values][field.key],
            }
          end.compact
        ]
      end

      # binding.pry
      
      # Now add in the user input_fields too if not already there in the input fields - generate_fields only returns fields in the form,
      # but when grouping we need the additional user fields in the raw responses too
      # Logic not needed here as these fields will only be used for grouping
      # TODO: Move to group generator? Do we only need the field that is being grouped by?


      # Now add in the user input_fields too if not already there in the input fields
      user_field_keys = user_fields.map { |f| "u_#{f[:key]}" }
      responses_by_field.merge(
        user_field_keys.each_with_object({}) do |key, accu|
          next if responses_by_field.key?(key) # Field already present in input fields

          accu[key] = responses.map do |response|
            {
              id: response[:id],
              answer: response[:values][key],
            }
          end.compact
        end
      )
    end

    def merge_user_custom_field_values(input)
      user_values = input.author&.custom_field_values.map { |k, v| ["u_#{k}", v] }.to_h || {}
      user_values.merge(input.custom_field_values) # Idea values take priority over user values
    end

    # Get the results for a single survey question
    def generate_result_for_field(field_id)
      # NEW Query
      find_result(field_id)


      # OLD Query
      # field = find_question(field_id)
      # result = visit field
      # add_averages([result]).first
    end

    # Get the results for all survey questions
    def generate_results
      results = input_fields.filter_map { |f| f.id ? visit(f) : nil } # Skip other/follow_up questions which have no ID
      if results.present?
        results = add_question_numbers_to_results results
        results = add_page_response_count_to_results results
        results = add_averages results
        results = add_additional_fields_to_results results
        results = cleanup_results results
      end

      {
        results: results,
        totalSubmissions: total_response_count,
      }
    end

    def visit_number(field)
      responses = base_responses(field.key).map { |r| r.except(:id) } # TODO: A lot of repetition of this pattern - refactor?
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
      # TODO: Convert this.
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
      # New version
      file_ids = base_responses(field.key).map { |a| a[:answer]['id'] } || []

      # OLD VERSION
      # file_ids = inputs
      #   .select("custom_field_values->'#{field.key}'->'id' as value")
      #   .where("custom_field_values->'#{field.key}' IS NOT NULL")
      #   .map(&:value)

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

    attr_reader :phase, :input_fields, :user_fields, :inputs, :locales, :responses_by_field

    def add_additional_fields_to_results(results)
      results # This method is a placeholder for overriding in subclasses
    end

    def core_field_attributes(field, response_count: nil)
      response_count ||= base_responses(field.key).size
      {
        inputType: field.input_type,
        question: field.title_multiloc,
        description: field.description_multiloc,
        customFieldId: field.id,
        required: field.required,
        grouped: false,
        hidden: false,
        totalResponseCount: num_times_field_seen(field.key),  # TODO: Change to questionSeenCount?
        questionResponseCount: response_count, # TODO: Change to questionAnsweredCount?
        pageNumber: nil,
        questionNumber: nil,
        questionCategory: field.question_category
      }
    end

    def base_responses(field_key, with_nil: false)
      return responses_by_field[field_key] if with_nil

      # NEW VERSION
      responses_by_field[field_key]
        &.select { |r| r[:answer].present? }

      # OLD VERSION
      # inputs
      #   .select("custom_field_values->'#{field.key}' as value")
      #   .where("custom_field_values->'#{field.key}' IS NOT NULL")
      #   .map do |response|
      #   { answer: response.value }
      # end
    end

    def visit_select_base(field)
      # query = inputs.select(
      #   select_field_query(field, as: 'answer')
      # )
      # answers = construct_select_answers(query, field)

      responses = select_field_answers(field.key)

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

    def select_field_answers(field_key, with_nil: false)
      # Extract all the responses from array values (if multiselect)
      base_responses(field_key, with_nil:).flat_map do |r|
        r[:answer].is_a?(Array) ?
          r[:answer].map { |a| { id: r[:id], answer: a } } :
          { id: r[:id], answer: r[:answer] }
      end
    end

    def nil_response_count(field, matrix_statement_key: nil)
      nil_count = responses_by_field[field.key].size - base_responses(field.key).size
      return nil_count unless matrix_statement_key

      # For matrix questions we also need to count those that did not answer the specific statement
      nil_count + base_responses(field.key).count { |h| !h[:answer].key?(matrix_statement_key) }
    end

    # def select_field_query(field, as: 'answer')
    #   table = field.resource_type == 'User' ? 'users' : 'ideas'
    #
    #   if field.supports_single_selection?
    #     "COALESCE(#{table}.custom_field_values->'#{field.key}', 'null') as #{as}"
    #   elsif field.supports_multiple_selection?
    #     %{
    #       jsonb_array_elements(
    #         CASE WHEN (
    #           jsonb_path_exists(#{table}.custom_field_values, '$ ? (exists (@."#{field.key}"))') AND
    #           jsonb_typeof(#{table}.custom_field_values->'#{field.key}') = 'array'
    #         ) THEN #{table}.custom_field_values->'#{field.key}'
    #           ELSE '[null]'::jsonb END
    #       ) as #{as}
    #   }
    #   else
    #     raise "Unsupported field type: #{field.input_type}"
    #   end
    # end

    def build_select_response(answers, field)
      # NEW QUERY
      question_response_count = base_responses(field.key).size

      # OLD QUERY
      # NOTE: This is an additional query for selects so impacts performance slightly
      # question_response_count = inputs.where("custom_field_values->'#{field.key}' IS NOT NULL").count

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

      # counts = input.group_by { |h| h[:answer] }.transform_values(&:count)
      #
      # # Build the result array with all required answers
      # answers = ["cat", "dog", "cow", "pig", "no_response", nil]
      # result = answers.map { |a| { answer: a, count: counts[a] || 0 } }


      # answer_keys = generate_select_answer_keys(field)
      #
      # grouped_answers_hash = select_group_query(query)
      #   .each_with_object({}) do |(answer, count), accu|
      #   valid_answer = answer_keys.include?(answer) ? answer : nil
      #
      #   accu[valid_answer] ||= { answer: valid_answer, count: 0 }
      #   accu[valid_answer][:count] += count
      # end
      #
      # answer_keys.map do |key|
      #   grouped_answers_hash[key] || { answer: key, count: 0 }
      # end
    end

    # def select_group_query(query)
    #   Idea
    #     .select(:answer)
    #     .from(query)
    #     .group(:answer)
    #     .count
    # end

    def generate_select_answer_keys(field)
      (field.supports_linear_scale? ? (1..field.maximum).to_a : field.ordered_transformed_options.map(&:key))
    end

    def matrix_linear_scale_statements(field)
      field.matrix_statements.pluck(:key, :title_multiloc).to_h do |statement_key, statement_title_multiloc|
        # OLD VERSION
        # statement_counts = inputs.group("custom_field_values->'#{field.key}'->'#{statement_key}'").count

        # NEW VERSION
        statement_counts = base_responses(field.key)
          .map { |h| h[:answer][statement_key] }
          .compact
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
      responses = base_responses(field.key).map { |r| r.except(:id) }
      response_count = responses.size
      core_field_attributes(field, response_count:).merge({
        mapConfigId: field&.map_config&.id, "#{field.input_type}Responses": responses
      })
    end

    # Get any associated text responses - where follow-up question or other option is used
    def get_text_responses(field_key)
      # NEW VERSION
      base_responses(field_key)
        &.map { |a| a.except(:id) }
        &.sort_by { |a| a[:answer] } || []

      # OLD VERSION
      # inputs
      #   .select("custom_field_values->'#{field_key}' as value")
      #   .where("custom_field_values->'#{field_key}' IS NOT NULL")
      #   # Remove all sequences of one or more whitespace characters (including spaces, newlines, tabs),
      #   # then check the result is not empty. TRIM would not handle newlines correctly.
      #   .where("regexp_replace(custom_field_values->>'#{field_key}', '[[:space:]]+', '', 'g') != ''")
      #   .map { |answer| { answer: answer.value.to_s } }
      #   .sort_by { |a| a[:answer] }
    end

    def find_result(result_field_id)
      result = generate_results[:results].find { |r| r[:customFieldId] == result_field_id }
      raise 'Question not found' unless result

      result
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
