class WebApi::V1::InviteSerializer < ActiveModel::Serializer

  attributes :id, :token, :email

  belongs_to :group
  belongs_to :inviter

end
