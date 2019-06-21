class WebApi::V1::Fast::MembershipSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :created_at

  belongs_to :user
  belongs_to :group
end