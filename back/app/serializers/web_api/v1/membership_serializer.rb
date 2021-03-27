class WebApi::V1::MembershipSerializer < WebApi::V1::BaseSerializer
  attributes :created_at

  belongs_to :user
  belongs_to :group
end