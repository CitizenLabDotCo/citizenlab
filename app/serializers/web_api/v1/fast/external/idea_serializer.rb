class WebApi::V1::Fast::External::IdeaSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :slug, :title_multiloc, :body_multiloc, :author_name, :upvotes_count, :downvotes_count, :published_at, :project_id, :budget

  attribute :url do |object|
    Frontend::UrlService.new.model_to_url object
  end

  attribute :latitude do |object|
    RGeo::GeoJSON.encode(object.location_point)&.dig('coordinates',1)
  end

  attribute :longitude do |object|
    RGeo::GeoJSON.encode(object.location_point)&.dig('coordinates',0)
  end

  has_many :topics
  has_many :areas
  has_many :idea_images, serializer: WebApi::V1::Fast::External::ImageSerializer
end