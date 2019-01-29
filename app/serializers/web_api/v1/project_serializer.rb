class WebApi::V1::ProjectSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :description_preview_multiloc, :slug, :header_bg, :visible_to, :process_type, :ideas_count, :comments_count, :avatars_count, :internal_role, :publication_status, :created_at, :updated_at, :ordering
  # ParticipationContext attributes
  attribute :participation_method, if: :is_participation_context?
  attribute :posting_enabled, if: :is_participation_context?
  attribute :commenting_enabled, if: :is_participation_context?
  attribute :voting_enabled, if: :is_participation_context?
  attribute :voting_method, if: :is_participation_context?
  attribute :voting_limited_max, if: :is_participation_context?
  attribute :presentation_mode, if: :is_participation_context?
  attribute :survey_embed_url, if: :is_participation_context?
  attribute :survey_service, if: :is_participation_context?
  attribute :max_budget, if: :is_participation_context?

  has_many :project_images, serializer: WebApi::V1::ImageSerializer
  has_many :areas
  has_many :topics
  has_many :permissions
  has_many :avatars, serializer: WebApi::V1::AvatarSerializer
  
  has_one :action_descriptor
  has_one :user_basket
  has_one :current_phase, serializer: WebApi::V1::PhaseSerializer, unless: :is_participation_context?

  def header_bg
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def is_participation_context?
    object.is_participation_context?
  end

  def current_phase
    TimelineService.new.current_phase(object)
  end

  def action_descriptor
    @participation_context_service ||= ParticipationContextService.new
    posting_disabled_reason = @participation_context_service.posting_disabled_reason object, current_user
    taking_survey_disabled_reason = @participation_context_service.taking_survey_disabled_reason object, current_user
    {
      posting: {
        enabled: !posting_disabled_reason,
        disabled_reason: posting_disabled_reason,
        future_enabled: posting_disabled_reason && @participation_context_service.future_posting_enabled_phase(object, current_user)&.start_at
      },
      taking_survey: {
        enabled:!taking_survey_disabled_reason,
        disabled_reason: taking_survey_disabled_reason
      }
    }
  end

  def user_basket
    current_user&.baskets&.find_by participation_context_id: object.id
  end

  def avatars_count
    avatars_for_project[:total_count]
  end

  def avatars
    avatars_for_project[:users]
  end

  private

  def avatars_for_project
    @avatars_for_project ||= AvatarsService.new.avatars_for_project(object, limit: 3)
  end

end
