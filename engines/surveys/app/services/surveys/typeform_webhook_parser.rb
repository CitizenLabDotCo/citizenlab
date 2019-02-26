module Surveys
  class TypeformWebhookParser
    include TypeformParser

    def body_to_response body
      Response.new(
        **parse_root(body),
        user: parse_user(body),
        answers: parse_answers(body)
      )
    end

    private

    def parse_root body
      {
        survey_service: 'typeform',
        external_survey_id: body.dig(:form_response, :form_id),
        external_response_id: body.dig(:form_response, :token),
        started_at: Time.parse(body.dig(:form_response, :landed_at)),
        submitted_at: Time.parse(body.dig(:form_response, :submitted_at))
      }
    end

    def parse_answers body
      body.dig(:form_response,:answers).map do |answer|
        question_id = answer.dig(:field, :id)
        field_definition = find_field_definition(body, question_id)
        value = extract_value_from_answer(answer)
        {
          question_id: question_id,
          question_text: field_definition[:title],
          value: value
        }
      end
    end

    def parse_user body
      nil
    end

    def find_field_definition body, field_id
      body.dig(:form_response, :definition, :fields).find do |field|
        field[:id] == field_id
      end
    end

  end
end
