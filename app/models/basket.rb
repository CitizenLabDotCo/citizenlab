class Basket < ApplicationRecord
  belongs_to :user
  belongs_to :participation_context, polymorphic: true

  has_many :baskets_ideas, dependent: :destroy
  has_many :ideas, through: :baskets_ideas

  validates :user, :participation_context, presence: true
  validate :in_budgeting_participation_context


  def total_budget
  	self.ideas.pluck(:budget).compact.inject(0){|sum,x| sum + x }
  end

  def budget_exceeds_limit?
  	self.total_budget > self.participation_context.max_budget
  end


  private

  def in_participatory_budgeting_participation_context
  	if !participation_context.budgeting?
  		errors.add(:participation_context, :is_not_budgeting, message: 'is not a in budgeting method')
  	end
  end
end
