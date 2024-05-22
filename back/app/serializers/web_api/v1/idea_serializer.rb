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
    TextImageService.new.render_data_images_multiloc object.body_multiloc, field: :body_multiloc, imageable: object
  end

  attribute :internal_comments_count, if: proc { |object, params|
    can_moderate?(object, params)
  }

  attribute :action_descriptor do |object, params|
    @idea_permissions_service = params[:permissions_service] || Permissions::IdeaPermissionsService.new
    @idea_permissions_service.action_descriptors object, current_user(params)
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
WebApi::V1::IdeaSerializer.include(BulkImportIdeas::Extensions::WebApi::V1::IdeaSerializer)
