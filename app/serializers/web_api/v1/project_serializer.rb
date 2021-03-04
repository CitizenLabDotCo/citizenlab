class WebApi::V1::ProjectSerializer < WebApi::V1::BaseSerializer
  include WebApi::V1::ParticipationContextSerializer

  attributes :title_multiloc, :description_preview_multiloc, :slug, :visible_to, :process_type, :ideas_count, :comments_count, :internal_role, :created_at, :updated_at

  attribute :publication_status do |object|
    object.admin_publication.publication_status
  end

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images object, :description_multiloc
  end

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  attribute :action_descriptor do |object, params|
    @participation_context_service ||= ParticipationContextService.new
    user = current_user(params)
    posting_disabled_reason = @participation_context_service.posting_idea_disabled_reason_for_project object, user
    commenting_disabled_reason = @participation_context_service.commenting_idea_disabled_reason_for_project object, user
    voting_disabled_reason = @participation_context_service.voting_idea_disabled_reason_for_project object, user
    taking_survey_disabled_reason = @participation_context_service.taking_survey_disabled_reason_for_project object, user
    taking_poll_disabled_reason = @participation_context_service.taking_poll_disabled_reason_for_project object, user
    {
      posting_idea: {
        enabled: !posting_disabled_reason,
        disabled_reason: posting_disabled_reason,
        future_enabled: posting_disabled_reason && @participation_context_service.future_posting_idea_enabled_phase(object, current_user(params))&.start_at
      },
      commenting_idea: {
        enabled: !commenting_disabled_reason,
        disabled_reason: commenting_disabled_reason,
      },
      voting_idea: {
        enabled: !voting_disabled_reason,
        disabled_reason: voting_disabled_reason,
      },
      comment_voting_idea: {
        # You can vote if you can comment.
        enabled: !commenting_disabled_reason,
        disabled_reason: commenting_disabled_reason,
      },
      taking_survey: {
        enabled:!taking_survey_disabled_reason,
        disabled_reason: taking_survey_disabled_reason
      },
      taking_poll: {
        enabled:!taking_poll_disabled_reason,
        disabled_reason: taking_poll_disabled_reason
      }
    }
  end

  attribute :avatars_count do |object, params|
    avatars_for_project(object, params)[:total_count]
  end

  attribute :participants_count do |object, params|
    @participants_service ||= ParticipantsService.new
    @participants_service.project_participants(object).size
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

  has_one :admin_publication

  has_many :project_images, serializer: WebApi::V1::ImageSerializer
  has_many :areas
  has_many :topics
  has_many :projects_topics
  has_many :avatars, serializer: WebApi::V1::AvatarSerializer do |object, params|
    avatars_for_project(object, params)[:users]
  end

  has_one :user_basket, record_type: :basket, if: Proc.new { |object, params|
    signed_in? object, params
  } do |object, params|
    user_basket object, params
  end
  has_one :current_phase, serializer: WebApi::V1::PhaseSerializer, record_type: :phase, if: Proc.new { |object, params|
    !object.participation_context?
  } do |object|
    TimelineService.new.current_phase(object)
  end


  def self.avatars_for_project object, params
    # TODO call only once (not a second time for counts)
    @participants_service ||= ParticipantsService.new
    AvatarsService.new(@participants_service).avatars_for_project(object, limit: 3)
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

WebApi::V1::ProjectSerializer.prepend_if_ee('ProjectFolders::WebApi::V1::Patches::ProjectSerializer')
WebApi::V1::ProjectSerializer.include_if_ee('IdeaAssignment::WebApi::V1::Extensions::ProjectSerializer')
