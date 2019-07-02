class WebApi::V1::Fast::AvatarSerializer < WebApi::V1::Fast::BaseSerializer
  set_type :avatar

  attribute :avatar do |object|
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end
end
