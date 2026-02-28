# frozen_string_literal: true

# == Schema Information
#
# Table name: surveys_responses
#
#  id                   :uuid             not null, primary key
#  phase_id             :uuid             not null
#  survey_service       :string           not null
#  external_survey_id   :string           not null
#  external_response_id :string           not null
#  user_id              :uuid
#  started_at           :datetime
#  submitted_at         :datetime         not null
#  answers              :jsonb
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  deleted_at           :datetime
#
# Indexes
#
#  index_surveys_responses_on_deleted_at  (deleted_at)
#  index_surveys_responses_on_phase_id    (phase_id)
#  index_surveys_responses_on_user_id     (user_id)
#
module Surveys
  class Response < ApplicationRecord
    acts_as_paranoid
    belongs_to :user, optional: true
    belongs_to :phase

    validates :submitted_at, presence: true
    validates :survey_service, presence: true, inclusion: { in: SurveyPhase::SURVEY_SERVICES }
    validates :external_survey_id, presence: true

    ANSWERS_JSON_SCHEMA_STR = Rails.root.join('engines/free/surveys/config/schemas/response_answers.json_schema').read
    ANSWERS_JSON_SCHEMA = JSON.parse(ANSWERS_JSON_SCHEMA_STR)

    validates :answers, presence: true, json: { schema: ANSWERS_JSON_SCHEMA_STR }

    def project_id
      phase.try(:project_id)
    end
  end
end
