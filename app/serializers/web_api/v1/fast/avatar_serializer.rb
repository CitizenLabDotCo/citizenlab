class WebApi::V1::Fast::AvatarSerializer < WebApi::V1::Fast::BaseSerializer
  set_type :avatar
  set_id :id do |object|
    "#{object.id}-avatar"
  end
  attribute :avatar

  def avatar
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

end
