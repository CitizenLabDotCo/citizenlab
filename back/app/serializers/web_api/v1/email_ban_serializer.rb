# frozen_string_literal: true

class WebApi::V1::EmailBanSerializer < WebApi::V1::BaseSerializer
  attributes :reason, :created_at

  belongs_to :banned_by, serializer: WebApi::V1::UserSerializer
end
