class WebApi::V1::Fast::GroupsProjectSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :created_at

  belongs_to :group
end