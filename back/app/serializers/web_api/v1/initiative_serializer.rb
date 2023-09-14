# frozen_string_literal: true

class WebApi::V1::InitiativeSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc,
    :slug,
    :publication_status,
    :likes_count,
    :comments_count,
    :internal_comments_count,
    :official_feedbacks_count,
    :followers_count,
    :location_point_geojson,
    :location_description,
    :created_at,
    :updated_at,
    :published_at,
    :expires_at,
    :reactions_needed,
    :anonymous,
    :author_hash,
    :editing_locked,
    :public

  attribute :author_name do |object, params|
    name_service = UserDisplayNameService.new(AppConfiguration.instance, current_user(params))
    name_service.display_name!(object.author)
  end

  attribute :body_multiloc do |object|
    TextImageService.new.render_data_images object, :body_multiloc
  end

  attribute :header_bg do |object|
    object.header_bg && object.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
  end

  attribute :internal_comments_count, if: proc { |object, params|
    can_moderate?(object, params)
  }

  attribute :cosponsorships do |object, params|
    name_service = UserDisplayNameService.new(AppConfiguration.instance, current_user(params))

    object.cosponsors_initiatives.includes(:user).map do |ci|
      { user_id: ci.user_id, name: name_service.display_name!(ci.user), status: ci.status }
    end
  end

  attribute :public do |object|
    object.initiative_status ? object.initiative_status.public? : false
  end

  has_many :initiative_images, serializer: WebApi::V1::ImageSerializer
  has_many :topics
  has_many :areas
  has_many :cosponsors, record_type: :user, serializer: WebApi::V1::UserSerializer

  belongs_to :author, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :initiative_status
  belongs_to :assignee, if: proc { |object, params|
    can_moderate? object, params
  }, record_type: :user, serializer: WebApi::V1::UserSerializer

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

  def self.can_moderate?(_object, params)
    current_user(params) && UserRoleService.new.can_moderate_initiatives?(current_user(params))
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
      params.dig(:user_followers, [object.id, 'Initiative'])&.first
    else
      current_user(params)&.follows&.find do |follow|
        follow.followable_id == object.id && follow.followable_type == 'Initiative'
      end
    end
  end
end
