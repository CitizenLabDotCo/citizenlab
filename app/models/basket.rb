class Basket < ApplicationRecord
  belongs_to :user
  belongs_to :participation_context, polymorphic: true

  has_many :baskets_ideas, dependent: :destroy
  has_many :ideas, through: :baskets_ideas

  validates :user, :participation_context, presence: true
  validate :in_budgeting_participation_context
  validate :submitted_and_exceeds_limit, on: :basket_submission

  scope :submitted, -> { where.not(submitted_at: nil) }

  def total_budget
  	self.ideas.pluck(:budget).compact.inject(0){|sum,x| sum + x }
  end

  def budget_exceeds_limit?
  	self.total_budget > self.participation_context.max_budget
  end


  private

  def in_budgeting_participation_context
  	if !participation_context.budgeting?
  		errors.add(:participation_context, :is_not_budgeting, message: 'is not a in budgeting method')
  	end
  end

  def submitted_and_exceeds_limit
    if submitted_at && budget_exceeds_limit?
      errors.add(:ideas, :exceed_budget_limit, message: 'exceed the budget limit while the basket is submitted')
    end
  end
end
