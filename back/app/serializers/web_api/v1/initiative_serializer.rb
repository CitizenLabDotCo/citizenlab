# frozen_string_literal: true

class WebApi::V1::InitiativeSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :slug, :publication_status, :upvotes_count, :comments_count, :official_feedbacks_count, :location_point_geojson, :location_description, :created_at, :updated_at, :published_at, :expires_at, :votes_needed, :anonymous, :author_hash

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

  has_many :initiative_images, serializer: WebApi::V1::ImageSerializer
  has_many :topics
  has_many :areas

  belongs_to :author, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :initiative_status
  belongs_to :assignee, if: proc { |object, params|
    can_moderate? object, params
  }, record_type: :user, serializer: WebApi::V1::UserSerializer

  has_one :user_vote, if: proc { |object, params|
    signed_in? object, params
  }, record_type: :vote, serializer: WebApi::V1::VoteSerializer do |object, params|
    cached_user_vote object, params
  end

  def self.can_moderate?(_object, params)
    current_user(params) && UserRoleService.new.can_moderate_initiatives?(current_user(params))
  end

  def self.cached_user_vote(object, params)
    if params[:vbii]
      params.dig(:vbii, object.id)
    else
      object.votes.where(user_id: current_user(params)&.id).first
    end
  end
end
