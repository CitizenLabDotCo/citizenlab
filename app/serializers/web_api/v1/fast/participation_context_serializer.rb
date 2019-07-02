module WebApi::V1::Fast::ParticipationContextSerializer
  extend ActiveSupport::Concern
  include Surveys::WebApi::V1::SurveyParticipationContextSerializer

  included do
    with_options if: Proc.new { |object|
      object.is_participation_context?
    } do
      attribute :participation_method
      attribute :posting_enabled
      attribute :commenting_enabled
      attribute :voting_enabled
      attribute :voting_method
      attribute :voting_limited_max
      attribute :presentation_mode
      attribute :survey_embed_url
      attribute :survey_service
      attribute :max_budget
    end
  end

end
