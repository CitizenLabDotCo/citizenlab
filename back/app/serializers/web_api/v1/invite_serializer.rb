# frozen_string_literal: true

class WebApi::V1::InviteSerializer < WebApi::V1::BaseSerializer
  attributes :accepted_at, :updated_at, :created_at

  attribute :token, if: proc { |object, params| view_token?(object, params) }

  attribute :activate_invite_url, if: proc { |object, params| view_token?(object, params) } do |object|
    Frontend::UrlService.new.invite_url object.token, locale: Locale.new(object.invitee.locale)
  end

  belongs_to :invitee, record_type: :user, serializer: WebApi::V1::UserSerializer
  belongs_to :inviter, record_type: :user, serializer: WebApi::V1::UserSerializer

  def self.view_token?(object, params)
    InvitePolicy.new(current_user(params), object).view_token?
  end
end
