# frozen_string_literal: true

module WebApi::V1::ParticipationContextSerializer
  extend ActiveSupport::Concern
  include DocumentAnnotation::WebApi::V1::DocumentAnnotationParticipationContextSerializer
  include Polls::WebApi::V1::PollParticipationContextSerializer
  include Surveys::WebApi::V1::SurveyParticipationContextSerializer

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
      attribute :reacting_dislike_enabled
      attribute :reacting_dislike_method
      attribute :reacting_dislike_limited_max
      attribute :allow_anonymous_participation
      attribute :presentation_mode
      attribute :ideas_order
      attribute :input_term
      attribute :voting_method, if: proc { |object| object.voting? }
      attribute :voting_max_total, if: proc { |object| object.voting? }
      attribute :voting_min_total, if: proc { |object| object.voting? }
      attribute :voting_max_votes_per_idea, if: proc { |object| object.voting? }
      attribute :voting_term, if: proc { |object| object.voting? }
    end
  end
end
