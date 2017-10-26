class Api::V1::GroupsProjectSerializer < ActiveModel::Serializer
  attributes :id, :created_at

  belongs_to :group
end