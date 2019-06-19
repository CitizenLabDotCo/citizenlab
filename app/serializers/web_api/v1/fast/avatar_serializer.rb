class WebApi::V1::Fast::AvatarSerializer < ActiveModel::Serializer
  include FastJsonapi::ObjectSerializer

  set_type :avatar
  set_id :id do |object|
    "#{object.id}-avatar"
  end
  attribute :avatar

  meta do |object, params|
    params[:meta]
  end

  def avatar
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

end
