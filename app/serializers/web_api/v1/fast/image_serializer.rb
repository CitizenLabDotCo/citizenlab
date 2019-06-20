class WebApi::V1::Fast::ImageSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :id, :ordering, :created_at, :updated_at

  attribute :versions do |object|
    object.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end
end
