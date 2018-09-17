class WebApi::V1::BasketSerializer < ActiveModel::Serializer
  attributes :id, :submitted_at, :total_budget, :budget_exceeds_limit?

  belongs_to :participation_context
  belongs_to :user
  has_many :baskets_ideas
  has_many :ideas


  def ideas
  	Idea.find object.baskets_ideas.order(created_at: :desc).left_outer_joins(:idea).pluck(:idea_id)
  end

end
