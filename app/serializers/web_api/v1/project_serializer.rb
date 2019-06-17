class WebApi::V1::ProjectSerializer < ActiveModel::Serializer
  include WebApi::V1::ParticipationContextSerializer

  attributes :id, :title_multiloc, :description_multiloc, :description_preview_multiloc, :slug, :header_bg, :visible_to, :process_type, :ideas_count, :comments_count, :avatars_count, :allocated_budget, :internal_role, :publication_status, :created_at, :updated_at, :ordering
  attribute :timeline_active, if: :timeline?

  has_many :project_images, serializer: WebApi::V1::ImageSerializer
  has_many :areas
  has_many :topics
  has_many :avatars, serializer: WebApi::V1::AvatarSerializer
  
  has_one :action_descriptor
  has_one :user_basket
  has_one :current_phase, serializer: WebApi::V1::PhaseSerializer, unless: :is_participation_context?

  belongs_to :default_assignee, if: :can_moderate?

  def header_bg
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def current_phase
    TimelineService.new.current_phase(object)
  end

  def action_descriptor
    @participation_context_service ||= ParticipationContextService.new
    posting_disabled_reason = @participation_context_service.posting_disabled_reason_for_project object, current_user
    commenting_disabled_reason = @participation_context_service.commenting_disabled_reason_for_project object, current_user
    voting_disabled_reason = @participation_context_service.voting_disabled_reason_for_project object, current_user
    taking_survey_disabled_reason = @participation_context_service.taking_survey_disabled_reason_for_project object, current_user
    {
      posting: {
        enabled: !posting_disabled_reason,
        disabled_reason: posting_disabled_reason,
        future_enabled: posting_disabled_reason && @participation_context_service.future_posting_enabled_phase(object, current_user)&.start_at
      },
      commenting: {
        enabled: !commenting_disabled_reason,
        disabled_reason: commenting_disabled_reason,
      },
      voting: {
        enabled: !voting_disabled_reason,
        disabled_reason: voting_disabled_reason,
      },
      taking_survey: {
        enabled:!taking_survey_disabled_reason,
        disabled_reason: taking_survey_disabled_reason
      }
    }
  end

  def user_basket
    if @instance_options[:user_baskets]
      @instance_options.dig(:user_baskets, object.id)&.first
    else
      current_user&.baskets&.find_by participation_context_id: object.id
    end
  end

  def avatars_count
    avatars_for_project[:total_count]
  end

  def avatars
    avatars_for_project[:users]
  end

  def allocated_budget
    if @instance_options[:allocated_budgets]
      @instance_options.dig(:allocated_budgets, object.id)
    else
      Rails.cache.fetch("#{object.cache_key}/allocated_budget") do
        ParticipationContextService.new.allocated_budget object
      end
    end
  end

  # checked by included ParticipationContextSerializer
  def is_participation_context?
    object.is_participation_context?
  end

  def timeline?
    object.timeline?
  end

  def timeline_active
    if @instance_options[:timeline_active]
      @instance_options.dig(:timeline_active, object.id)
    else
      TimelineService.new.timeline_active object
    end
  end

  def can_moderate?
    ProjectPolicy.new(scope, object).moderate?
  end

  private

  def avatars_for_project
    @avatars_for_project ||= AvatarsService.new.avatars_for_project(object, limit: 3)
  end



end
