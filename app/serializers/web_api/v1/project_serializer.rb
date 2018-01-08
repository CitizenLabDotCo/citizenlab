class WebApi::V1::ProjectSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :description_preview_multiloc, :slug, :header_bg, :visible_to, :ideas_count, :created_at, :updated_at, :presentation_mode

  has_many :project_images, serializer: WebApi::V1::ImageSerializer
  has_many :areas
  has_many :topics
  
  def header_bg
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

end
