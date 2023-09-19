# frozen_string_literal: true

class WebApi::V1::ParticipationContextSerializer < WebApi::V1::BaseSerializer
  include DocumentAnnotation::WebApi::V1::DocumentAnnotationParticipationContextSerializer
  include Polls::WebApi::V1::PollParticipationContextSerializer
  include Surveys::WebApi::V1::SurveyParticipationContextSerializer

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
  end

  with_options if: proc { |context|
    context.participation_context? && context.voting?
  } do
    attribute :voting_method
    attribute :voting_max_total
    attribute :voting_min_total
    attribute :voting_max_votes_per_idea
    attribute :baskets_count
    attribute :voting_term_singular_multiloc do |context|
      context.voting_term_singular_multiloc_with_fallback
    end
    attribute :voting_term_plural_multiloc do |context|
      context.voting_term_plural_multiloc_with_fallback
    end
  end

  attribute :votes_count, if: proc { |context, params|
    context.participation_context? \
    && context.voting? \
    && (
      (current_user(params) && UserRoleService.new.can_moderate?(context, current_user(params))) \
      || TimelineService.new.phase_is_complete?(context)
    )
  }
end
