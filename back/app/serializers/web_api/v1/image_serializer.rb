# frozen_string_literal: true

class WebApi::V1::ImageSerializer < WebApi::V1::BaseSerializer
  attributes :ordering, :created_at, :updated_at

  attribute :alt_text_multiloc, if: proc { |object| object.respond_to?(:alt_text_multiloc) }

  attribute :versions do |object|
    object.image.versions.to_h { |k, v| [k.to_s, v.url] }
  end
end
