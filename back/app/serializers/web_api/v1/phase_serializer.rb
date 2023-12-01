# frozen_string_literal: true

class WebApi::V1::PhaseSerializer < WebApi::V1::BaseSerializer
  include Polls::WebApi::V1::PollPhaseSerializer
  include Surveys::WebApi::V1::SurveyPhaseSerializer
  include DocumentAnnotation::WebApi::V1::DocumentAnnotationPhaseSerializer

  attributes :title_multiloc, :start_at, :end_at, :created_at, :updated_at, :ideas_count, :campaigns_settings,
    :participation_method, :posting_enabled, :posting_method, :posting_limited_max, :commenting_enabled,
    :reacting_enabled, :reacting_like_method, :reacting_like_limited_max,
    :reacting_dislike_enabled, :reacting_dislike_method, :reacting_dislike_limited_max,
    :allow_anonymous_participation, :presentation_mode, :ideas_order, :input_term

  with_options if: proc { |phase|
    phase.voting?
  } do
    attribute :voting_method
    attribute :voting_max_total
    attribute :voting_min_total
    attribute :voting_max_votes_per_idea
    attribute :baskets_count
    attribute :voting_term_singular_multiloc do |phase|
      phase.voting_term_singular_multiloc_with_fallback
    end
    attribute :voting_term_plural_multiloc do |phase|
      phase.voting_term_plural_multiloc_with_fallback
    end
  end

  attribute :votes_count, if: proc { |phase, params|
    phase.voting? \
    && (
      (current_user(params) && UserRoleService.new.can_moderate?(phase, current_user(params))) \
      || TimelineService.new.phase_is_complete?(phase)
    )
  }

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images_multiloc object.description_multiloc, field: :description_multiloc, imageable: object
  end

  attribute :previous_phase_end_at_updated do |object|
    object.previous_phase_end_at_updated?
  end

  belongs_to :project

  has_one :user_basket, if: proc { |object, params|
    signed_in? object, params
  } do |object, params|
    user_basket object, params
  end

  has_one :report, serializer: ReportBuilder::WebApi::V1::ReportSerializer

  has_many :permissions

  def self.user_basket(object, params)
    preloaded_user_basket = params.dig(:user_baskets, object.id)&.first
    preloaded_user_basket || current_user(params)&.baskets&.select do |basket|
      basket.phase_id == object.id
    end&.first
  end
end
