class WebApi::V1::InitiativeSerializer < ActiveModel::Serializer

  attributes :id, :title_multiloc, :body_multiloc, :author_name, :slug, :publication_status, :upvotes_count, :downvotes_count, :location_point_geojson, :location_description, :created_at, :updated_at, :published_at

  has_many :topics
  has_many :areas

  belongs_to :author

  has_one :user_vote, if: :signed_in? do |serializer|
    serializer.cached_user_vote
  end


  def signed_in?
    scope
  end

  def cached_user_vote
    if @instance_options[:vbii]
      @instance_options.dig(:vbii, object.id)
    else
       object.votes.where(user_id: scope.id).first
     end
  end
end
