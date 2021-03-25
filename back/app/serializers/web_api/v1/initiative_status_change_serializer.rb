class WebApi::V1::InitiativeStatusChangeSerializer < WebApi::V1::BaseSerializer
  attribute :created_at, :updated_at

  belongs_to :initiative_status
  belongs_to :initiative
  belongs_to :user
  belongs_to :official_feedback
end
