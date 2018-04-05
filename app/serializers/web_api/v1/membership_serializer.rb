class WebApi::V1::MembershipSerializer < ActiveModel::Serializer
  attributes :id, :created_at

  belongs_to :user
  belongs_to :group
end