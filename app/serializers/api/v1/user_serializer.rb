class Api::V1::UserSerializer < ActiveModel::Serializer
  include Knock::Authenticable

  attributes :id, :first_name, :last_name, :slug, :locale, :avatar
  attribute :email, if: :view_private_attributes?

  def view_private_attributes?
    Pundit.policy!(current_user, object).view_private_attributes?
  end

  def avatar
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
    # object.avatar_url
  end

end
