class WebApi::V1::Fast::InviteSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :token, :invite_text, :accepted_at, :updated_at, :created_at

  attribute :activate_invite_url do |object|
    Frontend::UrlService.new.invite_url object.token, locale: object.invitee.locale
  end

  belongs_to :invitee, record_type: :user, serializer: WebApi::V1::Fast::UserSerializer
  belongs_to :inviter, record_type: :user, serializer: WebApi::V1::Fast::UserSerializer
end
