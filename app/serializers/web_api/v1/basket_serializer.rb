class WebApi::V1::BasketSerializer < ActiveModel::Serializer
  attributes :id, :submitted_at, :total_budget, :budget_exceeds_limit?

  belongs_to :participation_context
  belongs_to :user
  has_many :ideas

end
