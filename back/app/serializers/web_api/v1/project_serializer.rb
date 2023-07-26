# frozen_string_literal: true

class WebApi::V1::ProjectSerializer < WebApi::V1::ParticipationContextSerializer
  attributes(
    :description_preview_multiloc,
    :title_multiloc,
    :comments_count,
    :ideas_count,
    :followers_count,
    :include_all_areas,
    :internal_role,
    :process_type,
    :slug,
    :visible_to,
    :created_at,
    :updated_at
  )

  attribute :folder_id do |project|
    project.folder&.id
  end

  attribute :publication_status do |object|
    object.admin_publication.publication_status
  end

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images object, :description_multiloc
  end

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :action_descriptor do |object, params|
    @participation_context_service ||= ParticipationContextService.new
    user = current_user(params)
    posting_disabled_reason = @participation_context_service.posting_idea_disabled_reason_for_project object, user
    commenting_disabled_reason = @participation_context_service.commenting_idea_disabled_reason_for_project object, user
    reacting_disabled_reason = @participation_context_service.idea_reacting_disabled_reason_for object, user
    liking_disabled_reason = @participation_context_service.idea_reacting_disabled_reason_for object, user, mode: 'up'
    disliking_disabled_reason = @participation_context_service.idea_reacting_disabled_reason_for object, user, mode: 'down'
    annotating_document_disabled_reason = @participation_context_service.annotating_document_disabled_reason_for_project object, user
    taking_survey_disabled_reason = @participation_context_service.taking_survey_disabled_reason_for_project object, user
    taking_poll_disabled_reason = @participation_context_service.taking_poll_disabled_reason_for_project object, user
    voting_disabled_reason = @participation_context_service.voting_disabled_reason_for_project object, user
    {
      posting_idea: {
        enabled: !posting_disabled_reason,
        disabled_reason: posting_disabled_reason,
        future_enabled: posting_disabled_reason && @participation_context_service.future_posting_idea_enabled_phase(object, current_user(params))&.start_at
      },
      commenting_idea: {
        enabled: !commenting_disabled_reason,
        disabled_reason: commenting_disabled_reason
      },
      reacting_idea: {
        enabled: !reacting_disabled_reason,
        disabled_reason: reacting_disabled_reason,
        up: {
          enabled: !liking_disabled_reason,
          disabled_reason: liking_disabled_reason
        },
        down: {
          enabled: !disliking_disabled_reason,
          disabled_reason: disliking_disabled_reason
        }
      },
      comment_reacting_idea: {
        # You can react if you can comment.
        enabled: !commenting_disabled_reason,
        disabled_reason: commenting_disabled_reason
      },
      annotating_document: {
        enabled: !annotating_document_disabled_reason,
        disabled_reason: annotating_document_disabled_reason
      },
      taking_survey: {
        enabled: !taking_survey_disabled_reason,
        disabled_reason: taking_survey_disabled_reason
      },
      taking_poll: {
        enabled: !taking_poll_disabled_reason,
        disabled_reason: taking_poll_disabled_reason
      },
      voting: {
        enabled: !voting_disabled_reason,
        disabled_reason: voting_disabled_reason
      }
    }
  end

  attribute :avatars_count do |object, params|
    avatars_for_project(object, params)[:total_count]
  end

  attribute :participants_count do |object, _params|
    @participants_service ||= ParticipantsService.new
    @participants_service.project_participants_count(object)
  end

  attribute :allocated_budget do |object, params|
    if params[:allocated_budgets]
      params.dig(:allocated_budgets, object.id)
    else
      ParticipationContextService.new.allocated_budget object
    end
  end

  attribute :timeline_active, if: proc { |object, _params|
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
  has_many :topics, serializer: WebApi::V1::TopicSerializer
  has_many :avatars, serializer: WebApi::V1::AvatarSerializer do |object, params|
    avatars_for_project(object, params)[:users]
  end
  has_many :permissions

  has_one :user_basket, record_type: :basket, if: proc { |object, params|
    signed_in? object, params
  } do |object, params|
    user_basket object, params
  end

  has_one :user_follower, record_type: :follower, if: proc { |object, params|
    signed_in? object, params
  } do |object, params|
    user_follower object, params
  end

  has_one :current_phase, serializer: WebApi::V1::PhaseSerializer, record_type: :phase, if: proc { |object, _params|
    !object.participation_context?
  } do |object|
    TimelineService.new.current_phase(object)
  end

  def self.avatars_for_project(object, _params)
    # TODO: call only once (not a second time for counts)
    @participants_service ||= ParticipantsService.new
    AvatarsService.new(@participants_service).avatars_for_project(object, limit: 3)
  end

  def self.user_basket(object, params)
    if params[:user_baskets]
      params.dig(:user_baskets, [object.id, 'Project'])&.first
    else
      current_user(params)&.baskets&.find do |basket|
        basket.participation_context_id == object.id && basket.participation_context_type == 'Project'
      end
    end
  end

  def self.user_follower(object, params)
    if params[:user_followers]
      params.dig(:user_followers, [object.id, 'Project'])&.first
    else
      current_user(params)&.follows&.find do |follow|
        follow.followable_id == object.id && follow.followable_type == 'Project'
      end
    end
  end

  def self.can_moderate?(object, params)
    current_user(params) && UserRoleService.new.can_moderate_project?(object, current_user(params))
  end
end

WebApi::V1::ProjectSerializer.include(IdeaAssignment::Extensions::WebApi::V1::ProjectSerializer)
WebApi::V1::ProjectSerializer.include(ContentBuilder::Extensions::WebApi::V1::ProjectSerializer)
