class Api::V1::ProjectSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_multiloc, :slug, :created_at, :updated_at
end
