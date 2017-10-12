class Api::V1::GroupsProjectSerializer < ActiveModel::Serializer
  attributes :id

  belongs_to :group
end