class WebApi::V1::Fast::IdeaSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :id, :title_multiloc, :body_multiloc, :author_name, :slug, :publication_status, :upvotes_count, :downvotes_count, :comments_count, :official_feedbacks_count, :location_point_geojson, :location_description, :created_at, :updated_at, :published_at, :budget, :baskets_count

  attribute :action_descriptor do |object, params|
    @participation_context_service = params[:pcs] || ParticipationContextService.new
    commenting_disabled_reason = @participation_context_service.commenting_disabled_reason_for_idea(object, current_user(params))
    voting_disabled_reason = @participation_context_service.voting_disabled_reason_for_idea(object, current_user(params))
    cancelling_votes_disabled_reason = @participation_context_service.cancelling_votes_disabled_reason(object, current_user(params))
    budgeting_disabled_reason = @participation_context_service.budgeting_disabled_reason_for_idea(object, current_user(params))
    commenting_action_descriptor = {
      enabled: !commenting_disabled_reason,
      disabled_reason: commenting_disabled_reason,
      future_enabled: commenting_disabled_reason && @participation_context_service.future_commenting_enabled_phase(object.project, current_user(params))&.start_at
    }
    {
      commenting: commenting_action_descriptor,
      voting: {
        enabled: !voting_disabled_reason,
        disabled_reason: voting_disabled_reason,
        future_enabled: voting_disabled_reason && @participation_context_service.future_voting_enabled_phase(object.project, current_user(params))&.start_at,
        cancelling_enabled: !cancelling_votes_disabled_reason
      }, 
      # You can vote if you can comment.  
      comment_voting: commenting_action_descriptor,
      budgeting: {
        enabled: !budgeting_disabled_reason,
        disabled_reason: budgeting_disabled_reason,
        future_enabled: budgeting_disabled_reason && @participation_context_service.future_budgeting_enabled_phase(object.project, current_user(params))&.start_at
      }
    }
  end

  has_many :topics
  has_many :areas
  has_many :idea_images, serializer: WebApi::V1::Fast::ImageSerializer
  has_many :phases

  belongs_to :author, serializer: WebApi::V1::Fast::UserSerializer
  belongs_to :project
  belongs_to :idea_status
  belongs_to :assignee, if: Proc.new { |object, params|
    can_moderate? object, params
  }, serializer: WebApi::V1::Fast::UserSerializer

  has_one :user_vote, if: Proc.new { |object, params|
    signed_in? object, params
  }, serializer: WebApi::V1::Fast::UserSerializer do |object, params|
    cached_user_vote object, params
  end


  def self.signed_in? object, params
    current_user(params).present?
  end

  def self.can_moderate? object, params
    ProjectPolicy.new(current_user(params), object.project).moderate?
  end

  def self.cached_user_vote object, params
    if params[:vbii]
      params.dig(:vbii, object.id)
    else
       object.votes.where(user_id: current_user(params)&.id).first
     end
  end
end
