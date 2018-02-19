class WebApi::V1::InviteSerializer < ActiveModel::Serializer

  attributes :id, :token, :accepted_at, :created_at, :activate_invite_url

  belongs_to :invitee
  belongs_to :inviter
  

  def activate_invite_url
    FrontendService.new.invite_url object.token
  end

end
