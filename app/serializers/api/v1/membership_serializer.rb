class Api::V1::MembershipSerializer < ActiveModel::Serializer
  attributes :id

  belongs_to :user
end