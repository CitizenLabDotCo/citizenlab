class WebApi::V1::ClusteringSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :structure, :created_at, :updated_at
end
