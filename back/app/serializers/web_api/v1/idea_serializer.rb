# frozen_string_literal: true

class WebApi::V1::IdeaSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc,
             :body_multiloc,
             :slug,
             :publication_status,
             :upvotes_count,
             :downvotes_count,
             :comments_count,
             :official_feedbacks_count,
             :location_point_geojson,
             :location_description,
             :created_at,
             :updated_at,
             :published_at,
             :budget,
             :proposed_budget,
             :baskets_count,
             :anonymous,
             :author_hash

  attribute :author_name do |object, params|
    name_service = UserDisplayNameService.new(AppConfiguration.instance, current_user(params))
    name_service.display_name!(object.author)
  end

  attribute :body_multiloc do |object|
    TextImageService.new.render_data_images object, :body_multiloc
  end

  attribute :action_descriptor do |object, params|
    @participation_context_service = params[:pcs] || ParticipationContextService.new
    commenting_disabled_reason = @participation_context_service.commenting_disabled_reason_for_idea(object, current_user(params))
    upvoting_disabled_reason = @participation_context_service.idea_voting_disabled_reason_for(object, current_user(params), mode: 'up')
    downvoting_disabled_reason = @participation_context_service.idea_voting_disabled_reason_for(object, current_user(params), mode: 'down')
    cancelling_votes_disabled_reason = @participation_context_service.cancelling_votes_disabled_reason_for_idea(object, current_user(params))
    budgeting_disabled_reason = @participation_context_service.budgeting_disabled_reason_for_idea(object, current_user(params))
    comment_voting_disabled_reason = @participation_context_service.voting_disabled_reason_for_idea_comment(Comment.new(post: object), current_user(params))

    {
      commenting_idea: {
        enabled: !commenting_disabled_reason,
        disabled_reason: commenting_disabled_reason,
        future_enabled: commenting_disabled_reason && @participation_context_service.future_commenting_idea_enabled_phase(object.project, current_user(params))&.start_at
      },
      voting_idea: {
        enabled: !upvoting_disabled_reason,
        disabled_reason: upvoting_disabled_reason,
        cancelling_enabled: !cancelling_votes_disabled_reason,
        up: {
          enabled: !upvoting_disabled_reason,
          disabled_reason: upvoting_disabled_reason,
          future_enabled: upvoting_disabled_reason && @participation_context_service.future_upvoting_idea_enabled_phase(object.project, current_user(params))&.start_at
        },
        down: {
          enabled: !downvoting_disabled_reason,
          disabled_reason: downvoting_disabled_reason,
          future_enabled: downvoting_disabled_reason && @participation_context_service.future_downvoting_idea_enabled_phase(object.project, current_user(params))&.start_at
        }
      },
      comment_voting_idea: {
        enabled: !comment_voting_disabled_reason,
        disabled_reason: comment_voting_disabled_reason,
        future_enabled: comment_voting_disabled_reason && @participation_context_service.future_comment_voting_idea_enabled_phase(object.project, current_user(params))&.start_at
      },
      budgeting: {
        enabled: !budgeting_disabled_reason,
        disabled_reason: budgeting_disabled_reason,
        future_enabled: budgeting_disabled_reason && @participation_context_service.future_budgeting_enabled_phase(object.project, current_user(params))&.start_at
      }
    }
  end

  has_many :topics
  has_many :idea_images, serializer: WebApi::V1::ImageSerializer
  has_many :phases

  belongs_to :author, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :project
  belongs_to :idea_status

  has_one :user_vote, if: proc { |object, params|
    signed_in? object, params
  }, record_type: :vote, serializer: WebApi::V1::VoteSerializer do |object, params|
    cached_user_vote object, params
  end

  def self.can_moderate?(object, params)
    current_user(params) && UserRoleService.new.can_moderate_project?(object.project, current_user(params))
  end

  def self.cached_user_vote(object, params)
    if params[:vbii]
      params.dig(:vbii, object.id)
    else
      object.votes.where(user_id: current_user(params)&.id).first
    end
  end
end

WebApi::V1::IdeaSerializer.include(IdeaAssignment::Extensions::WebApi::V1::IdeaSerializer)
WebApi::V1::IdeaSerializer.include(IdeaCustomFields::Extensions::WebApi::V1::IdeaSerializer)
