class WebApi::V1::Fast::External::ImageSerializer < WebApi::V1::Fast::BaseSerializer
  attribute :ordering

  attribute :versions do |object|
    object.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end
end