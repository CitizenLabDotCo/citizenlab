# == Schema Information
#
# Table name: baskets
#
#  id                         :uuid             not null, primary key
#  submitted_at               :datetime
#  user_id                    :uuid
#  participation_context_id   :uuid
#  participation_context_type :string
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#
# Indexes
#
#  index_baskets_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Basket < ApplicationRecord
  belongs_to :user
  belongs_to :participation_context, polymorphic: true

  has_many :baskets_ideas, dependent: :destroy
  has_many :ideas, through: :baskets_ideas

  validates :user, :participation_context, presence: true
  validate :basket_submission, on: :basket_submission

  scope :submitted, -> { where.not(submitted_at: nil) }

  def total_budget
  	self.ideas.pluck(:budget).compact.inject(0){|sum,x| sum + x }
  end

  def budget_exceeds_limit?
  	self.total_budget > self.participation_context.max_budget
  end
  
  private
  
  def less_than_min_budget?
  	total_budget < participation_context.min_budget
  end

  def basket_submission
    return unless submitted_at

    if less_than_min_budget?
      errors.add(:ideas, :less_than_min_budget, message: 'less than the min budget while the basket is submitted')
    elsif budget_exceeds_limit?
      errors.add(:ideas, :exceed_budget_limit, message: 'exceed the budget limit while the basket is submitted')
    end
  end
end
