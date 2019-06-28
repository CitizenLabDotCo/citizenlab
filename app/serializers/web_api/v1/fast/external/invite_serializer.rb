class WebApi::V1::Fast::External::InviteSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :invite_text, :accepted_at

  attribute :activate_invite_url do |object|
    Frontend::UrlService.new.invite_url object.token, locale: object.invitee.locale
  end

  belongs_to :invitee, serializer: WebApi::V1::Fast::External::UserSerializer
  belongs_to :inviter, serializer: WebApi::V1::Fast::External::UserSerializer
end
