# frozen_string_literal: true

class WebApi::V1::External::UserSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :slug, :avatar

  def avatar
    object.avatar && object.avatar.versions.to_h { |k, v| [k.to_s, v.url] }
  end
end
