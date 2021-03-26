class WebApi::V1::External::UserSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :slug, :avatar

  def avatar
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

end
