# frozen_string_literal: true

class WebApi::V1::External::InviteSerializer < ActiveModel::Serializer
  attributes :id, :invite_text, :accepted_at, :activate_invite_url

  belongs_to :invitee, serializer: WebApi::V1::External::UserSerializer
  belongs_to :inviter, serializer: WebApi::V1::External::UserSerializer

  def activate_invite_url
    Frontend::UrlService.new.invite_url object.token, locale: Locale.new(object.invitee.locale)
  end
end
