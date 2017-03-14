class Api::V1::UserSerializer < ActiveModel::Serializer
  attributes :id, :name, :slug, :avatar

  def avatar
    object.avatar.url
  end
end
