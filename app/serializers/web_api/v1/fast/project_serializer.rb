class WebApi::V1::Fast::ProjectSerializer < WebApi::V1::Fast::BaseSerializer
  include WebApi::V1::Fast::ParticipationContextSerializer

  attributes :title_multiloc, :description_multiloc, :description_preview_multiloc, :slug, :visible_to, :process_type, :ideas_count, :comments_count, :internal_role, :publication_status, :created_at, :updated_at, :ordering

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  attribute :action_descriptor do |object, params|
    @participation_context_service ||= ParticipationContextService.new
    posting_disabled_reason = @participation_context_service.posting_disabled_reason_for_project object, current_user(params)
    commenting_disabled_reason = @participation_context_service.commenting_disabled_reason_for_project object, current_user(params)
    voting_disabled_reason = @participation_context_service.voting_disabled_reason_for_project object, current_user(params)
    taking_survey_disabled_reason = @participation_context_service.taking_survey_disabled_reason_for_project object, current_user(params)
    {
      posting: {
        enabled: !posting_disabled_reason,
        disabled_reason: posting_disabled_reason,
        future_enabled: posting_disabled_reason && @participation_context_service.future_posting_enabled_phase(object, current_user(params))&.start_at
      },
      commenting: {
        enabled: !commenting_disabled_reason,
        disabled_reason: commenting_disabled_reason,
      },
      voting: {
        enabled: !voting_disabled_reason,
        disabled_reason: voting_disabled_reason,
      },
      comment_voting: {
        # You can vote if you can comment.
        enabled: !commenting_disabled_reason,
        disabled_reason: commenting_disabled_reason,
      },
      taking_survey: {
        enabled:!taking_survey_disabled_reason,
        disabled_reason: taking_survey_disabled_reason
      }
    }
  end

  attribute :avatars_count do |object, params|
    avatars_for_project(object, params)[:total_count]
  end

  attribute :allocated_budget do |object, params|
    if params[:allocated_budgets]
      params.dig(:allocated_budgets, object.id)
    else
      ParticipationContextService.new.allocated_budget object
    end
  end

  attribute :timeline_active, if: Proc.new { |object, params|
    object.timeline?
  } do |object, params|
    if params[:timeline_active]
      params.dig(:timeline_active, object.id)
    else
      TimelineService.new.timeline_active object
    end
  end

  has_many :project_images, serializer: WebApi::V1::Fast::ImageSerializer
  has_many :areas
  has_many :topics
  has_many :avatars, serializer: WebApi::V1::Fast::AvatarSerializer do |object, params|
    avatars_for_project(object, params)[:users]
  end
  
  has_one :user_basket, record_type: :basket, if: Proc.new { |object, params|
    signed_in? object, params
  } do |object, params|
    user_basket object, params
  end
  has_one :current_phase, serializer: WebApi::V1::Fast::PhaseSerializer, record_type: :phase, if: Proc.new { |object, params|
    !object.is_participation_context?
  } do |object|
    TimelineService.new.current_phase(object)
  end

  belongs_to :default_assignee, record_type: :assignee, if: Proc.new { |object, params|
    can_moderate? object, params
  }

  
  def self.avatars_for_project object, params
    # TODO call only once (not a second time for counts)
    AvatarsService.new.avatars_for_project(object, limit: 3)
  end  

  def self.user_basket object, params
    if params[:user_baskets]
      params.dig(:user_baskets, [object.id, 'Project'])&.first
    else
      current_user(params)&.baskets&.find do |basket|
        basket.participation_context_id == object.id && basket.participation_context_type == 'Project'
      end
    end
  end

  def self.can_moderate? object, params
    ProjectPolicy.new(current_user(params), object).moderate?
  end
end
