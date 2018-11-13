class WebApi::V1::BasketSerializer < ActiveModel::Serializer
  attributes :id, :submitted_at, :total_budget, :budget_exceeds_limit?

  belongs_to :participation_context
  belongs_to :user
  has_many :baskets_ideas
  has_many :ideas


  def ideas
    # object.ideas.joins(:baskets_ideas).where(baskets_ideas: {basket_id: object.id}).order('baskets_ideas.created_at DESC')
    object.ideas.order('baskets_ideas.created_at DESC')
  end

end
