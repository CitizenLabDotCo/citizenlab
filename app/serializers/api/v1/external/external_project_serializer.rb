class Api::V1::External::ExternalProjectSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :slug
end
