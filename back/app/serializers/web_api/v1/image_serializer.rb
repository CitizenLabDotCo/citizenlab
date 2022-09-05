# frozen_string_literal: true

class WebApi::V1::ImageSerializer < WebApi::V1::BaseSerializer
  attributes :ordering, :created_at, :updated_at

  attribute :versions do |object|
    object.image.versions.to_h { |k, v| [k.to_s, v.url] }
  end
end
