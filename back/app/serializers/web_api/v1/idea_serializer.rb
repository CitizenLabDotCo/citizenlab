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
    :submitted_at,
    :published_at,
    :budget,
    :proposed_budget,
    :manual_votes_amount,
    :anonymous,
    :author_hash

  attribute :author_name do |object, params|
    name_service = UserDisplayNameService.new(AppConfiguration.instance, current_user(params))
    name_service.display_name!(object.author)
  end

  attribute :body_multiloc do |object|
    TextImageService.new.render_data_images_multiloc object.body_multiloc, field: :body_multiloc, imageable: object
  end

  attribute :internal_comments_count, if: proc { |object, params|
    can_moderate?(object, params)
  }

  attribute :action_descriptors do |object, params|
    user_requirements_service = params[:user_requirements_service] || Permissions::UserRequirementsService.new(check_groups_and_verification: false)
    Permissions::IdeaPermissionsService.new(object, current_user(params), user_requirements_service: user_requirements_service).action_descriptors
  end

  attribute :expires_at, if: proc { |input|
    input.published? && input.participation_method_on_creation.supports_serializing_input?(:expires_at)
  } do |input|
    input.published_at + input.creation_phase.expire_days_limit.days
  end

  attribute :reacting_threshold, if: proc { |input|
    input.participation_method_on_creation.supports_serializing_input?(:reacting_threshold)
  } do |input|
    input.creation_phase.reacting_threshold
  end

  has_many :input_topics, serializer: WebApi::V1::InputTopicSerializer
  has_many :idea_images, serializer: WebApi::V1::ImageSerializer
  has_many :phases
  has_many :ideas_phases
  has_many :cosponsors, record_type: :user, serializer: WebApi::V1::UserSerializer

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

  def self.find_ideas_phase(idea, phase)
    idea.ideas_phases.find { |ideas_phase| ideas_phase.phase_id == phase.id }
  end

  attribute :baskets_count do |idea, params|
    if params[:phase]
      find_ideas_phase(idea, params[:phase])&.baskets_count
    else
      idea.baskets_count
    end
  end

  attribute :votes_count do |idea, params|
    if params[:phase]
      find_ideas_phase(idea, params[:phase])&.votes_count
    else
      idea.votes_count
    end
  end

  attribute :total_votes, if: proc { |_, params|
    params[:phase]
  } do |idea, params|
    idea.total_votes(params[:phase])
  end

  attribute :manual_votes_last_updated_at, if: proc { |idea, params|
    can_moderate?(idea, params)
  }

  attribute :claim_token, if: ->(_idea, params) { params[:include_claim_token] } do |idea|
    idea.claim_token&.token
  end

  attribute :claim_token_expires_at, if: ->(_idea, params) { params[:include_claim_token] } do |idea|
    idea.claim_token&.expires_at
  end

  has_one :manual_votes_last_updated_by, record_type: :user, serializer: WebApi::V1::UserSerializer, if: proc { |idea, params|
    can_moderate?(idea, params)
  }
end

WebApi::V1::IdeaSerializer.include(IdeaAssignment::Extensions::WebApi::V1::IdeaSerializer)
WebApi::V1::IdeaSerializer.include(IdeaCustomFields::Extensions::WebApi::V1::IdeaSerializer)
WebApi::V1::IdeaSerializer.include(BulkImportIdeas::Extensions::WebApi::V1::IdeaSerializer)
