class WebApi::V1::CustomFieldSerializer < ActiveModel::Serializer
  attributes :id, :key, :input_type, :title_multiloc, :description_multiloc, :required, :ordering, :enabled, :code, :created_at, :updated_at
end