class WebApi::V1::CustomFieldOptionSerializer < ActiveModel::Serializer
  attributes :id, :key, :title_multiloc, :is_default, :ordering, :created_at, :updated_at
end