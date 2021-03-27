class WebApi::V1::External::InitiativeSerializer < ActiveModel::Serializer
  attributes :id, :slug, :url, :title_multiloc, :body_multiloc, :author_name, :upvotes_count, :published_at, :latitude, :longitude, :header_bg

  has_many :topics
  has_many :areas
  has_many :initiative_images, serializer: WebApi::V1::External::ImageSerializer


  def header_bg
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

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