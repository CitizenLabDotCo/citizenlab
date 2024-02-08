# frozen_string_literal: true

class WebApi::V1::CustomFieldOptionSerializer < WebApi::V1::BaseSerializer
  attributes :key, :title_multiloc, :ordering, :other, :created_at, :updated_at

  has_one :image, serializer: ::WebApi::V1::ImageSerializer
end
