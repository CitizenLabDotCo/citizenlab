class Api::V1::LiteProjectSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :slug
end
