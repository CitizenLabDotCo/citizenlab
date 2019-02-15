module Surveys::WebApi::V1::SurveyParticipationContextSerializer
  extend ActiveSupport::Concern

  included do
    with_options if: :is_participation_context? do
      attribute :survey_embed_url
      attribute :survey_service
    end
  end
end