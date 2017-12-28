class WebApi::V1::External::ProjectSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :description_preview_multiloc, :slug
end
