class WebApi::V1::External::ImageSerializer < ActiveModel::Serializer
  attributes :id, :versions, :ordering

  def versions
    object.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end
end