module Surveys
  class Response < ApplicationRecord

    belongs_to :user, optional: true
    belongs_to :participation_context, polymorphic: true

    validates :submitted_at, presence: true
    validates :survey_service, presence: true, inclusion: {in: SurveyParticipationContext::SURVEY_SERVICES}
    validates :external_survey_id, presence: true

    ANSWERS_JSON_SCHEMA_STR = File.read(Rails.root.join('engines', 'free', 'surveys', 'config', 'schemas', 'response_answers.json_schema'))
    ANSWERS_JSON_SCHEMA = JSON.parse(ANSWERS_JSON_SCHEMA_STR)

    validates :answers, presence: true, json: {schema: ANSWERS_JSON_SCHEMA_STR}
  end
end