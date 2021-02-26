module Surveys
  class TypeformApiParser
    include TypeformParser

    class AuthorizationError < StandardError
      def initialize(options={})
        super
        @error_key = options.fetch(:error_key, 'INVALID_AUTHORIZATION')
        @description = options.fetch(:description, 'Invalid authorization header "Bearer"')
      end

      def error_key
        @error_key
      end

      def description
        @description
      end
    end

    def initialize(tf_api = nil)
      @tf_api = tf_api || Typeform::Api.new(Tenant.settings('typeform_surveys', 'user_token'))
    end

    def get_responses(form_id)
      response = @tf_api.form(form_id: form_id)
      if !response.success?
        if [401, 403].include? response.code
          raise AuthorizationError.new(error_key: response.parsed_response['code'], description: response.parsed_response['description'])
        else
          raise "Unhandled Typeform API error: #{response.parsed_response}"
        end
      end
      tf_form = response.parsed_response
      field_id_to_title = extract_field_titles(tf_form)
      tf_responses = @tf_api.all_responses(form_id: form_id, completed: true)
      tf_responses.map { |tfr| response_to_surveys_response(tfr, field_id_to_title, form_id) }
    end

    private

    def extract_field_titles(tf_form)
      tf_form['fields'].map do |f|
        [f['id'], f['title']]
      end.to_h
    end

    def response_to_surveys_response(tf_response, field_id_to_title, form_id)
      Response.new(
          **parse_root(tf_response, form_id),
          answers: parse_answers(tf_response['answers'], field_id_to_title)
      )
    end

    def parse_root(tf_response, form_id)
      {
          survey_service: 'typeform',
          external_survey_id: form_id,
          external_response_id: tf_response['token'],
          started_at: Time.parse(tf_response['landed_at']),
          submitted_at: Time.parse(tf_response['submitted_at'])
      }
    end

    def parse_answers(tf_answers, field_id_to_title)
      (tf_answers || []).map do |answer|
        question_id = answer.dig('field', 'id')
        {
            question_id: question_id,
            question_text: field_id_to_title[question_id],
            value: extract_value_from_answer(answer.with_indifferent_access)
        }
      end
    end
  end
end