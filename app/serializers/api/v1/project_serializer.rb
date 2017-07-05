class Api::V1::ProjectSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :slug, :header_bg, :ideas_count, :created_at, :updated_at

  has_many :project_images, serializer: Api::V1::ImageSerializer

  def header_bg
    object.header_bg && object.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

end
