# frozen_string_literal: true

class WebApi::V1::AvatarSerializer < WebApi::V1::BaseSerializer
  set_type :avatar

  attribute :avatar do |object|
    object.avatar && object.avatar.versions.to_h { |k, v| [k.to_s, v.url] }
  end
end
