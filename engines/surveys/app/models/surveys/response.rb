module Surveys
  class Response < ApplicationRecord

    belongs_to :user, optional: true
    belongs_to :participation_context, polymorphic: true

    validates :submitted_at, presence: true
    validates :survey_service, presence: true, inclusion: {in: SurveyParticipationContext::SURVEY_SERVICES}
    validates :external_survey_id, presence: true
  end
end