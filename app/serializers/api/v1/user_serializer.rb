class Api::V1::UserSerializer < ActiveModel::Serializer
  include Knock::Authenticable

  attributes :id, :name, :slug, :avatar
  attribute :email, if: :view_private_attributes?

  def view_private_attributes?
    Pundit.policy!(current_user, object).view_private_attributes?
  end

  def avatar
    object.avatar.url
  end

end
