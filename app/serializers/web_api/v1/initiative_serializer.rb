class WebApi::V1::InitiativeSerializer < ActiveModel::Serializer

  attributes :id, :title_multiloc, :body_multiloc, :author_name, :slug, :publication_status, :upvotes_count, :comments_count, :official_feedbacks_count, :location_point_geojson, :location_description, :created_at, :updated_at, :published_at, :header_bg

  has_many :initiative_images, serializer: WebApi::V1::ImageSerializer

  has_many :topics
  has_many :areas

  belongs_to :author
  belongs_to :initiative_status
  belongs_to :assignee, if: :can_moderate?

  has_one :user_vote, if: :signed_in? do |serializer|
    serializer.cached_user_vote
  end


  def header_bg
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

  def signed_in?
    scope
  end

  def can_moderate?
    InitiativePolicy.new(scope, object).moderate?
  end

  def cached_user_vote
    if @instance_options[:vbii]
      @instance_options.dig(:vbii, object.id)
    else
       object.votes.where(user_id: scope.id).first
     end
  end
end
