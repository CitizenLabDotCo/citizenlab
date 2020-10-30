class WebApi::V1::External::IdeaSerializer < ActiveModel::Serializer
  attributes :id, :slug, :url, :title_multiloc, :body_multiloc, :author_id, :author_name, :upvotes_count, :downvotes_count, :published_at, :latitude, :longitude, :project_id, :budget, :proposed_budget

  has_many :topics
  has_many :areas
  has_many :idea_images, serializer: WebApi::V1::External::ImageSerializer

  def url
    Frontend::UrlService.new.model_to_url object
  end

  def latitude
    RGeo::GeoJSON.encode(object.location_point)&.dig('coordinates',1)
  end

  def longitude
    RGeo::GeoJSON.encode(object.location_point)&.dig('coordinates',0)
  end
end