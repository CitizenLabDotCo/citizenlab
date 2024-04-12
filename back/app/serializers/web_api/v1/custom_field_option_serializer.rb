# frozen_string_literal: true

class WebApi::V1::CustomFieldOptionSerializer < WebApi::V1::BaseSerializer
  attributes :key, :title_multiloc, :ordering, :other, :created_at, :updated_at

  attribute :temp_id, if: proc { |object|
    object.temp_id.present?
  }

  has_one :image, serializer: ::WebApi::V1::ImageSerializer
end
