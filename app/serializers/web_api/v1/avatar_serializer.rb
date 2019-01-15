class WebApi::V1::AvatarSerializer < ActiveModel::Serializer

  attribute :avatar

  def avatar
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

end
