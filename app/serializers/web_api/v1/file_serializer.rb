class WebApi::V1::FileSerializer < ActiveModel::Serializer
  attributes :id, :file, :ordering, :created_at, :updated_at
end
