class Basket < ApplicationRecord
  belongs_to :user
  belongs_to :participation_context, polymorphic: true

  has_many :baskets_ideas, dependent: :destroy
  has_many :ideas, through: :baskets_ideas

  validates :user, :participation_context, presence: true


  def total_budget
  	self.ideas.pluck(:participatory_budget).compact.inject(0){|sum,x| sum + x }
  end

  def budget_exceeds_limit?
  	self.total_budget > self.participation_context.max_budget
  end
end
