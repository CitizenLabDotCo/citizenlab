# frozen_string_literal: true

class WebApi::V1::IdeaSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc,
    :body_multiloc,
    :slug,
    :publication_status,
    :likes_count,
    :dislikes_count,
    :comments_count,
    :internal_comments_count,
    :official_feedbacks_count,
    :followers_count,
    :location_point_geojson,
    :location_description,
    :created_at,
    :updated_at,
    :published_at,
    :budget,
    :proposed_budget,
    :baskets_count,
    :votes_count,
    :anonymous,
    :author_hash

  attribute :author_name do |object, params|
    name_service = UserDisplayNameService.new(AppConfiguration.instance, current_user(params))
    name_service.display_name!(object.author)
  end

  attribute :body_multiloc do |object|
    TextImageService.new.render_data_images object, :body_multiloc
  end

  attribute :internal_comments_count, if: proc { |object, params|
    can_moderate?(object, params)
  }

  attribute :action_descriptor do |object, params|
    @participation_context_service = params[:pcs] || ParticipationContextService.new
    commenting_disabled_reason = @participation_context_service.commenting_disabled_reason_for_idea(object, current_user(params))
    liking_disabled_reason = @participation_context_service.idea_reacting_disabled_reason_for(object, current_user(params), mode: 'up')
    disliking_disabled_reason = @participation_context_service.idea_reacting_disabled_reason_for(object, current_user(params), mode: 'down')
    cancelling_reactions_disabled_reason = @participation_context_service.cancelling_reacting_disabled_reason_for_idea(object, current_user(params))
    voting_disabled_reason = @participation_context_service.voting_disabled_reason_for_idea(object, current_user(params))
    comment_reacting_disabled_reason = @participation_context_service.reacting_disabled_reason_for_idea_comment(Comment.new(post: object), current_user(params))

    {
      commenting_idea: {
        enabled: !commenting_disabled_reason,
        disabled_reason: commenting_disabled_reason,
        future_enabled: commenting_disabled_reason && @participation_context_service.future_commenting_idea_enabled_phase(object.project, current_user(params))&.start_at
      },
      reacting_idea: {
        enabled: !liking_disabled_reason,
        disabled_reason: liking_disabled_reason,
        cancelling_enabled: !cancelling_reactions_disabled_reason,
        up: {
          enabled: !liking_disabled_reason,
          disabled_reason: liking_disabled_reason,
          future_enabled: liking_disabled_reason && @participation_context_service.future_liking_idea_enabled_phase(object.project, current_user(params))&.start_at
        },
        down: {
          enabled: !disliking_disabled_reason,
          disabled_reason: disliking_disabled_reason,
          future_enabled: disliking_disabled_reason && @participation_context_service.future_disliking_idea_enabled_phase(object.project, current_user(params))&.start_at
        }
      },
      comment_reacting_idea: {
        enabled: !comment_reacting_disabled_reason,
        disabled_reason: comment_reacting_disabled_reason,
        future_enabled: comment_reacting_disabled_reason && @participation_context_service.future_comment_reacting_idea_enabled_phase(object.project, current_user(params))&.start_at
      },
      voting: {
        enabled: !voting_disabled_reason,
        disabled_reason: voting_disabled_reason,
        future_enabled: voting_disabled_reason && @participation_context_service.future_voting_enabled_phase(object.project, current_user(params))&.start_at
      }
    }
  end

  has_many :topics
  has_many :idea_images, serializer: WebApi::V1::ImageSerializer
  has_many :phases
  has_many :ideas_phases

  belongs_to :author, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :project
  belongs_to :idea_status

  has_one :user_reaction, if: proc { |object, params|
    signed_in? object, params
  }, record_type: :reaction, serializer: WebApi::V1::ReactionSerializer do |object, params|
    cached_user_reaction object, params
  end

  has_one :user_follower, record_type: :follower, if: proc { |object, params|
    signed_in? object, params
  } do |object, params|
    user_follower object, params
  end

  def self.can_moderate?(object, params)
    current_user(params) && UserRoleService.new.can_moderate_project?(object.project, current_user(params))
  end

  def self.cached_user_reaction(object, params)
    if params[:vbii]
      params.dig(:vbii, object.id)
    else
      object.reactions.where(user_id: current_user(params)&.id).first
    end
  end

  def self.user_follower(object, params)
    if params[:user_followers]
      params.dig(:user_followers, [object.id, 'Idea'])&.first
    else
      current_user(params)&.follows&.find do |follow|
        follow.followable_id == object.id && follow.followable_type == 'Idea'
      end
    end
  end
end

WebApi::V1::IdeaSerializer.include(IdeaAssignment::Extensions::WebApi::V1::IdeaSerializer)
WebApi::V1::IdeaSerializer.include(IdeaCustomFields::Extensions::WebApi::V1::IdeaSerializer)
