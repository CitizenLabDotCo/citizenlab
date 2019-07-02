class WebApi::V1::GroupsProjectSerializer < WebApi::V1::BaseSerializer
  attributes :created_at

  belongs_to :group
end