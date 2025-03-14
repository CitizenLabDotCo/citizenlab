# frozen_string_literal: true

module Surveys
  class ResultsWithLogicGenerator < ResultsGenerator
    def generate_result_for_field(field_id)
      # Adding logic only makes sense for the full result set
      raise NotImplementedError, 'This method is not implemented'
    end

    def generate_results(logic_ids: [])
      @logic_ids = logic_ids
      super()
    end

    def visit_page(field)
      result = super
      result[:logic][:nextPageId] = field.logic['next_page_id'] if field.logic['next_page_id']
      result
    end

    private

    def add_additional_fields_to_results(results)
      results = add_logic_to_results results, @logic_ids
      change_counts_for_logic results, inputs.pluck(:custom_field_values)
    end

    def core_field_attributes(field, response_count: nil)
      super.merge({
        logic: {},
        questionViewedCount: 0, # Temporary field used when calculating the number of times a question is seen through logic
        key: field.key # Temporary field used when calculating the number of times a question is seen through logic
      })
    end

    def build_select_response(answers, field)
      super.merge({
        logic: get_option_logic(field)
      })
    end

    def get_option_logic(field)
      return {} if field.logic.blank?

      is_linear_or_rating = field.supports_linear_scale?
      options = if is_linear_or_rating
        # Create a unique ID for this linear scale option in the full results so we can filter logic
        (1..field.maximum).map { |value| { id: "#{field.id}_#{value}", key: value } }
      else
        field.ordered_options.map { |option| { id: option.id, key: option.key } }
      end

      # NOTE: Only options with logic will be returned
      any_other_answer_page_id = field.logic['rules']&.find { |r| r['if'] == 'any_other_answer' }&.dig('goto_page_id')
      option_logic = options.each_with_object({}) do |option, accu|
        rule_id = is_linear_or_rating ? option[:key] : option[:id]
        logic_next_page_id = field.logic['rules']&.find { |r| r['if'] == rule_id }&.dig('goto_page_id') || any_other_answer_page_id
        accu[option[:key]] = { id: option[:id], nextPageId: logic_next_page_id } if logic_next_page_id
      end

      no_answer_logic_page_id = field.logic['rules']&.find { |r| r['if'] == 'no_answer' }&.dig('goto_page_id')
      option_logic['no_answer'] = { id: "#{field.id}_no_answer", nextPageId: no_answer_logic_page_id } if no_answer_logic_page_id

      option_logic.present? ? { answer: option_logic } : {}
    end

    # Replace logicNextPageId with logicNextPageNumber & add number used by FE in logic tooltip
    # Add hidden flag to results based on logic ids supplied for filtering
    def add_logic_to_results(results, logic_ids)
      results_to_hide = []
      results = results.deep_dup.map do |result|
        field_id = result[:customFieldId]
        if supports_page_logic? result[:inputType]
          # Transform page logic
          logic_next_page_id = result[:logic][:nextPageId]
          if logic_next_page_id
            logic_skipped_fields = logic_skipped_field_ids(results, field_id, logic_next_page_id)
            result[:logic] = {
              nextPageNumber: @page_numbers[logic_next_page_id],
              numQuestionsSkipped: logic_skipped_fields.count { |f| f[:question] == true }
            }
            if logic_ids.include?(field_id)
              results_to_hide += logic_skipped_fields.pluck(:id)
            end
          end
        elsif supports_question_logic? result[:inputType]
          # Transform select option logic
          result[:logic][:answer]&.each_value do |answer|
            logic_next_page_id = answer[:nextPageId]
            if logic_next_page_id
              logic_skipped_fields = logic_skipped_field_ids(results, field_id, logic_next_page_id)
              answer[:nextPageNumber] = @page_numbers[logic_next_page_id]
              answer[:numQuestionsSkipped] = logic_skipped_fields.count { |f| f[:question] == true }
              answer.delete(:nextPageId)
              if logic_ids.include?(answer[:id])
                results_to_hide += logic_skipped_fields.pluck(:id)
              end
            end
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

    def logic_skipped_field_ids(results, field_id, goto_page_id)
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

    # If questions were skipped for a respondent due to logic:
    # - reduce the :totalResponseCount per question
    # - reduce the count of nil option picks and the :totalPickCount per question
    def change_counts_for_logic(results, survey_responses)
      survey_has_logic = !results.flatten.all? { |r| r[:logic] == {} }

      # Only need to calculate the logic if there is any
      if survey_has_logic
        results = results.deep_dup
        survey_responses.each do |response|
          next_page_number = nil
          skip_question = false
          results.map do |question|
            # Similar logic to logic_skipped_field_ids - TODO: Refactor to share?
            input_type = question[:inputType]
            page_number = question[:pageNumber]

            # We only skip pages & questions from the next page onwards
            if supports_page_logic? input_type
              if page_number == next_page_number
                next_page_number = nil
                skip_question = false
              elsif next_page_number
                skip_question = true
              end
            end

            # reduce the number of not answered if the question is skipped
            if skip_question && question[:answers].present?
              nil_answer = question[:answers].find { |a| a[:answer].nil? }
              nil_answer[:count] -= 1 if nil_answer && nil_answer[:count] > 0
            end

            unless skip_question
              # Only increment the number of times seen if we're not skipping the question/page
              question[:questionViewedCount] += 1

              # Calculate the next page number that will be seen
              if supports_question_logic? input_type
                answer_value = response[question[:key]] || 'no_answer'
                values = answer_value.is_a?(Array) ? answer_value : [answer_value] # Convert all values to an array so all fields can be treated the same
                highest_next_page_number_for_question = 0
                values.each do |value|
                  logic_match = question.dig(:logic, :answer, value)
                  if logic_match && logic_match[:nextPageNumber] > highest_next_page_number_for_question
                    # Only take the highest next page number from all options
                    highest_next_page_number_for_question = logic_match[:nextPageNumber]
                    next_page_number = highest_next_page_number_for_question
                  end
                end
              elsif supports_page_logic? input_type
                logic_match = question[:logic][:nextPageNumber]
                if logic_match
                  next_page_number = logic_match
                end
              end
            end
          end
        end
      end

      # Finalise the results
      results.map do |question|
        # Don't update any figures if the response count is higher than the viewed count
        # Can happen if logic changed after survey responses were collected and looks odd
        if survey_has_logic && question[:questionViewedCount] >= (question[:questionResponseCount])
          # Update the total response count with the new figure
          question[:totalResponseCount] = question[:questionViewedCount]

          # Update the total pick count because we've reduced the 'not_answered' answer count
          question[:totalPickCount] = question[:answers].pluck(:count).sum if question[:totalPickCount]
        end
      end

      results
    end

    def cleanup_results(results)
      # remove the temporary fields that are now not needed
      super.map do |question|
        question.delete(:questionViewedCount)
        question.delete(:key)
        question
      end
    end

    def supports_question_logic?(input_type)
      %w[select multiselect linear_scale multiselect_image rating].include? input_type
    end

    def supports_page_logic?(input_type)
      input_type == 'page'
    end
  end
end
