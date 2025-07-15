# frozen_string_literal: true

class WebApi::V1::PhaseSerializer < WebApi::V1::BaseSerializer
  include Polls::WebApi::V1::PollPhaseSerializer
  include Surveys::WebApi::V1::SurveyPhaseSerializer
  include DocumentAnnotation::WebApi::V1::DocumentAnnotationPhaseSerializer

  attributes :title_multiloc, :start_at, :end_at, :created_at, :updated_at, :ideas_count, :campaigns_settings,
    :participation_method, :submission_enabled, :commenting_enabled,
    :reacting_enabled, :reacting_like_method, :reacting_like_limited_max,
    :reacting_dislike_enabled, :reacting_dislike_method, :reacting_dislike_limited_max,
    :allow_anonymous_participation, :presentation_mode, :ideas_order, :input_term,
    :prescreening_enabled, :manual_voters_amount, :manual_votes_count,
    :similarity_enabled, :similarity_threshold_title, :similarity_threshold_body,
    :survey_popup_frequency

  %i[
    voting_method voting_max_total voting_min_total
    voting_max_votes_per_idea baskets_count
    native_survey_title_multiloc native_survey_button_multiloc
    expire_days_limit reacting_threshold autoshare_results_enabled
  ].each do |attribute_name|
    attribute attribute_name, if: proc { |phase|
      phase.pmethod.supports_serializing?(attribute_name)
    }
  end

  attribute :user_fields_in_form, if: proc { |phase|
    phase.pmethod.user_fields_in_form?
  }

  attribute :votes_count, if: proc { |phase, params|
    phase.pmethod.supports_serializing?(:votes_count) && view_votes?(phase, current_user(params))
  }

  attribute :total_votes_amount, if: proc { |phase, params|
    phase.pmethod.supports_serializing?(:total_votes_amount) && view_votes?(phase, current_user(params))
  } do |phase|
    phase.votes_count + phase.manual_votes_count
  end

  attribute :manual_voters_last_updated_at, if: proc { |phase, params|
    can_moderate?(phase, params)
  }

  has_one :manual_voters_last_updated_by, record_type: :user, serializer: WebApi::V1::UserSerializer, if: proc { |phase, params|
    can_moderate?(phase, params)
  }

  attribute :voting_term_singular_multiloc, if: proc { |phase|
    phase.pmethod.supports_serializing?(:voting_term_singular_multiloc)
  } do |phase|
    phase.voting_term_singular_multiloc_with_fallback
  end

  attribute :voting_term_plural_multiloc, if: proc { |phase|
    phase.pmethod.supports_serializing?(:voting_term_plural_multiloc)
  } do |phase|
    phase.voting_term_plural_multiloc_with_fallback
  end

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images_multiloc object.description_multiloc, field: :description_multiloc, imageable: object
  end

  attribute :previous_phase_end_at_updated do |object|
    object.previous_phase_end_at_updated?
  end

  attribute :report_public do |phase|
    phase.report&.public?
  end

  attribute :custom_form_persisted do |object|
    object.custom_form_persisted?
  end

  attribute :supports_survey_form do |phase|
    phase.pmethod.supports_survey_form?
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

  def self.can_moderate?(phase, params)
    current_user(params) && UserRoleService.new.can_moderate?(phase, current_user(params))
  end

  def self.view_votes?(phase, user)
    return true if user && UserRoleService.new.can_moderate?(phase, user)

    TimelineService.new.phase_is_complete?(phase)
  end
end
