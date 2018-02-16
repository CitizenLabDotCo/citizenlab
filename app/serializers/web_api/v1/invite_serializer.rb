class WebApi::V1::InviteSerializer < ActiveModel::Serializer

  attributes :id, :token, :accepted_at, :created_at

  belongs_to :invitee
  belongs_to :inviter

end
