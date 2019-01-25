module Surveys
  class TypeformWebhookParser

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
        started_at: Time.parse(body.dig(:form_response, :landed_at)),
        submitted_at: Time.parse(body.dig(:form_response, :submitted_at))
      }
    end

    def parse_answers body
      body.dig(:form_response,:answers).map do |answer|
        question_id = answer.dig(:field, :id)
        field_definition = find_field_definition(body, question_id)
        value = case answer[:type]
        when 'text' 
          answer[:text]
        when 'choice' 
          answer[:choice][:label]
        when 'choices' 
          answer[:choices][:labels]
        when 'email' 
          answer[:email]
        when 'url' 
          answer[:url]
        when 'file_url' 
          answer[:file_url]
        when 'boolean' 
          answer[:boolean]
        when 'number' 
          answer[:number]
        when 'date' 
          answer[:date]
        when 'payment' 
          answer[:payment] 
        else
          raise "Unsupported typeform answer type #{anser[:type]}"
        end

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
