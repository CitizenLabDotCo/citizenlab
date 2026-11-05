# frozen_string_literal: true

class WebApi::V1::InviteSerializer < WebApi::V1::BaseSerializer
  attributes :token, :accepted_at, :updated_at, :created_at

  attribute :activate_invite_url do |object|
    Frontend::UrlService.new.invite_url object.token, locale: Locale.new(object.invitee.locale)
  end

  belongs_to :invitee, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :inviter, record_type: :user, serializer: WebApi::V1::UserSerializer
end
