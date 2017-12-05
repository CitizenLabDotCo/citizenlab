class WebApi::V1::External::ProjectSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :slug
end
