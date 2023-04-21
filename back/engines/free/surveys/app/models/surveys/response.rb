# frozen_string_literal: true

# == Schema Information
#
# Table name: surveys_responses
#
#  id                         :uuid             not null, primary key
#  participation_context_id   :uuid             not null
#  participation_context_type :string           not null
#  survey_service             :string           not null
#  external_survey_id         :string           not null
#  external_response_id       :string           not null
#  user_id                    :uuid
#  started_at                 :datetime
#  submitted_at               :datetime         not null
#  answers                    :jsonb
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#
# Indexes
#
#  index_surveys_responses_on_participation_context  (participation_context_type,participation_context_id)
#  index_surveys_responses_on_user_id                (user_id)
#
module Surveys
  class Response < ApplicationRecord
    belongs_to :user, optional: true
    belongs_to :participation_context, polymorphic: true

    validates :submitted_at, presence: true
    validates :survey_service, presence: true, inclusion: { in: SurveyParticipationContext::SURVEY_SERVICES }
    validates :external_survey_id, presence: true

    ANSWERS_JSON_SCHEMA_STR = Rails.root.join('engines', 'free', 'surveys', 'config', 'schemas', 'response_answers.json_schema').read
    ANSWERS_JSON_SCHEMA = JSON.parse(ANSWERS_JSON_SCHEMA_STR)

    validates :answers, presence: true, json: { schema: ANSWERS_JSON_SCHEMA_STR }

    def project_id
      participation_context.try(:project_id)
    end
  end
end
