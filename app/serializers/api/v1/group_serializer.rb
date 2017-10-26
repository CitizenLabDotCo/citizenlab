class Api::V1::GroupSerializer < ActiveModel::Serializer
  attributes :id, :title_multiloc, :slug, :memberships_count
end