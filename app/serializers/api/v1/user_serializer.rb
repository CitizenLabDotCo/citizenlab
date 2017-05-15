class Api::V1::UserSerializer < ActiveModel::Serializer
  include Knock::Authenticable

  attributes :id, :first_name, :last_name, :slug, :locale, :avatar, :roles, :created_at, :updated_at
  attribute :email, if: :view_private_attributes?
  attribute :gender, if: :view_private_attributes?
  attribute :birthyear, if: :view_private_attributes?
  attribute :domicile, if: :view_private_attributes?
  attribute :education, if: :view_private_attributes?

  def view_private_attributes?
    Pundit.policy!(current_user, object).view_private_attributes?
  end

  def avatar
    object.avatar && object.avatar.versions.map{|k, v| [k.to_s, v.url]}.to_h
  end

end
