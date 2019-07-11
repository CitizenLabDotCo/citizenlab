class WebApi::V1::CustomFieldOptionSerializer < WebApi::V1::BaseSerializer
  attributes :key, :title_multiloc, :ordering, :created_at, :updated_at
end