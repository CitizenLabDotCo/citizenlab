# frozen_string_literal: true

module WebApi::V1::ParticipationContextSerializer
  extend ActiveSupport::Concern
  include Surveys::WebApi::V1::SurveyParticipationContextSerializer
  include Polls::WebApi::V1::PollParticipationContextSerializer

  included do
    with_options if: proc { |object|
      object.participation_context?
    } do
      attribute :participation_method
      attribute :posting_enabled
      attribute :posting_method
      attribute :posting_limited_max
      attribute :commenting_enabled
      attribute :reacting_enabled
      attribute :reacting_like_method
      attribute :reacting_like_limited_max
      attribute :downreacting_enabled
      attribute :reacting_dislike_method
      attribute :reacting_dislike_limited_max
      attribute :allow_anonymous_participation
      attribute :presentation_mode
      attribute :min_budget
      attribute :max_budget
      attribute :ideas_order
      attribute :input_term
    end
  end
end
