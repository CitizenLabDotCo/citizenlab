class WebApi::V1::ImageSerializer < ActiveModel::Serializer
  attributes :id, :versions, :ordering, :created_at, :updated_at

  def versions
    object.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end
end
