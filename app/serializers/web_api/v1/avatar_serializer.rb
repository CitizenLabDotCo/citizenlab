class WebApi::V1::AvatarSerializer < ActiveModel::Serializer

  type :avatars
  attribute :avatar

  def id
    "#{object.id}-avatar"
  end

  def avatar
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

end
